const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const opn = require('opn');
const path = require('path');
const util = require('./util');

const args = process.argv.slice(2);
const port = args.length > 0 ? parseInt(args[0]) : 8888;
const local_url = util.getURL(port);

let logged_in = false;
let curr_text = ''
util.createQR(local_url);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'static')));
app.use(fileUpload());

http.listen(port, function () {
    console.log(local_url);
    opn(`http://localhost:${port}/`);
});

app.get('/', function (req, res) {
    // if (logged_in)
    res.render('index', {
        page: './partials/syncpad'
    });
    // else
    //     res.render('login');
});

app.get('/api/get_text', (req, res) => {
    res.send(curr_text.split('\n').join('<br>'));
});


app.get('/login', (req, res) => {
    logged_in = true;
    io.emit('refresh');
    res.redirect('/');
});

app.get('/upload', (req, res) => {
    res.render('index', {
        page: './partials/upload'
    });
});

app.post('/upload', function (req, res) {
    let files = req.files.file;
    if (files.length) { // if multiple files uploaded
        files.forEach((file, i) => util.saveFile(file));
    } else {
        util.saveFile(files);
    }
    res.redirect('/upload');
});

io.on('connection', (socket) => {
    console.log('a client connected');
    socket.emit('update textarea', curr_text);
    socket.on('sync text', (text) => {
        console.log('> ' + text);
        curr_text = text;
        io.emit('update textarea', text);
    })

    socket.on('generate qr', () => {
        const chunks = [], len = 777;
        let i = 0;
        while (i < curr_text.length) {
            chunks.push(curr_text.substring(i, i + len));
            i += len;
        }

        Promise.all(chunks.map((chunk, i) => util.createTextQR(chunk, i)))
            .then(() => {
                console.log(chunks.length, 'QR created');
                io.emit('qr ready', chunks.length);
            })
            .catch((e) => {
                console.log('error', e);
            });
    })
})

process.on('SIGINT', function() {
    console.log('Deleting temp QRs, exiting...');
    util.clearTemp();
    process.exit();
});
