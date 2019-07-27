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
    qrcode.toFile('./static/qr.png', getURL(port), {
        margin: 0
    });
}

module.exports.createQR = createQR;