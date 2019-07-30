let express = require('express');
let fileUpload = require('express-fileupload');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let util = require('./util');

let logged_in = false;
let args = process.argv.slice(2);
let port = args.length > 0 ? parseInt(args[0]) : 8888;
util.createQR(port);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'static')));
app.use(fileUpload());

http.listen(port, function () {
    console.log(`http://localhost:${port}/`);
});

app.get('/', function (req, res) {
    if (logged_in)
        res.render('index', {
            page: './partials/syncpad'
        });
    else
        res.render('login');
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
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            util.save_file(file);
        }
        // files.forEach((file) => util.save_file(file));
    } else {
        util.save_file(files);
    }
    res.redirect('/upload');
});

io.on('connection', (socket) => {
    console.log('a client connected');
    socket.on('sync text', (text) => {
        console.log('received ' + text);
        io.emit('update textarea', text);
    })
})