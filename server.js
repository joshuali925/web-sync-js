let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let qr = require('./qr');

let sockets = {};
let args = process.argv.slice(2);
let port = args.length > 0 ? parseInt(args[0]) : 8888;
qr.createQR(port);

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(port, function () {
    console.log('http://localhost:' + port);
});

io.on('connection', (socket) => {
    console.log('connected!!!')
    socket.on('sync text', (text) => {
        console.log('received ' + text)
        io.emit('update textarea', text)
    })
})

