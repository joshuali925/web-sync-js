const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const util = require('./util');

const args = process.argv.slice(2);
const port = args.length > 0 ? parseInt(args[0]) : 8888;
let logged_in = false;
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
        files.forEach((file, i) => util.save_file(file));
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
