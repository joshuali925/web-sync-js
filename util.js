const fs = require('fs');

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
    let path = './static/images';
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
    qrcode.toFile(path + '/qr.png', url, {
        width: 150,
        height: 150,
    });
    qrcode.toFile(path + '/qr_small.png', url, {
        width: 100,
        height: 100,
        margin: 0
    });
}

function save_file(file, save_dir = '/mnt/z/download', filename = undefined) {
    if (!filename)
        filename = file.name;
    if (!fs.existsSync(save_dir))
        fs.mkdirSync(save_dir);
    file.mv(`${save_dir}/${filename}`);
}

module.exports.save_file = save_file;
module.exports.createQR = createQR;
