const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const opn = require('opn');
const path = require('path');
const util = require('./util');

const args = process.argv.slice(2);
const port = args.length > 0 ? parseInt(args[0]) : 18888;
const host = args.length > 1 ? parseInt(args[1]) : '127.0.0.1';
const local_url = util.getURL(host, port);

let logged_in = false;
let curr_text = ''
util.createQR(local_url);

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));
app.use(fileUpload());

http.listen(port, host, function () {
    console.log(`[${new Date().toISOString()}] server running on ${local_url}`);
    opn(`http://localhost:${port}/`);
});

app.get('/', function (req, res) {
    // if (logged_in)
    res.render('index', {
        page: path.join(__dirname, 'views', 'partials', 'syncpad')
    });
    // else
    //     res.render('login');
});

app.get('/api/get_text', (req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.headers['x-forwarded-for'] || req.socket.remoteAddress} /api/get_text`)
    res.send(curr_text.split('\n').join('<br>'));
});


app.get('/login', (req, res) => {
    logged_in = true;
    io.emit('refresh');
    res.redirect('/');
});

app.get('/upload', (req, res) => {
    res.render('index', {
        page: path.join(__dirname, 'views', 'partials', 'upload')
    });
});

app.post('/upload', function (req, res) {
    if (req.files) {
        let files = req.files.file;
        if (files.length) { // if multiple files uploaded
            files.forEach((file, i) => util.saveFile(file));
        } else {
            util.saveFile(files);
        }
    }
    res.redirect('/upload');
});

io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] ${socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress} connected`);
    socket.emit('update textarea', curr_text);
    socket.on('sync text', (text) => {
        curr_text = text;
        socket.broadcast.emit('update textarea', text);
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
