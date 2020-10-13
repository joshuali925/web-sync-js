const fs = require('fs');

function getIPAddress() {
    let interfaces = require('os').networkInterfaces();
    try {
        // assume on wifi
        return interfaces.wifi0[0].address;
    } catch (e) {
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
}

function getURL(port) {
    const ip = getIPAddress();
    return `http://${ip}:${port}/`;
}

function createQR(url) {
    // QR codes for login, url is http://local_ip:port/login
    const qrcode = require('qrcode');
    const path = './static/images';
    url += 'login';
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

function createTextQR(text, index = 0) {
    const qrcode = require('qrcode');
    const path = './static/images/temp';
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
    return qrcode.toFile(path + `/temp_qr${index}.png`, text, {
        width: 500,
        height: 500,
    })
}

function saveFile(file, saveDir = '/mnt/z/download', fileName = undefined) {
    if (!fileName)
        fileName = file.name;
    if (!fs.existsSync(saveDir))
        fs.mkdirSync(saveDir);
    file.mv(`${save_dir}/${fileName}`);
}

function clearTemp() {
    const path = './static/images/temp';
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = `${path}/${file}`;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
}

module.exports = {getURL, createQR, createTextQR, saveFile, clearTemp};
