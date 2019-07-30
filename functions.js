function getIPAddress() {
    let interfaces = require('os').networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }
    return '0.0.0.0';
}

function getURL(port) {
    let ip = getIPAddress();
    return `http://${ip}:${port}/login`;
}

function createQR(port) {
    let qrcode = require('qrcode');
    let url = getURL(port);
    qrcode.toFile('./static/images/qr.png', url, {
        width: 150,
        height: 150,
    });
    qrcode.toFile('./static/images/qr_small.png', url, {
        margin: 0
    });
}

module.exports.createQR = createQR;