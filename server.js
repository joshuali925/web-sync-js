let formidable = require('formidable');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let qr = require('./functions');

let sockets = {};
let logged_in = false;
let args = process.argv.slice(2);
let port = args.length > 0 ? parseInt(args[0]) : 8888;
qr.createQR(port);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'static')));

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

app.post('/upload_file', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        console.log(files)
        console.log(fields)
    });
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
    // res.render('index', {
    //     page: './partials/upload'
    // });
});

io.on('connection', (socket) => {
    console.log('a client connected');
    socket.on('sync text', (text) => {
        console.log('received ' + text);
        io.emit('update textarea', text);
    })
})