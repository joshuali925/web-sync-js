const fs = require("fs");
const path = require("path");

const qrPath = path.join(__dirname, "static", "images");
const tempQrPath = qrPath + "/temp";

function getIPAddress() {
  let interfaces = require("os").networkInterfaces();
  try {
    // assume on wifi
    return interfaces.wifi0[0].address;
  } catch (e) {
    for (let devName in interfaces) {
      let iface = interfaces[devName];
      for (let i = 0; i < iface.length; i++) {
        let alias = iface[i];
        if (
          alias.family === "IPv4" &&
          alias.address !== "127.0.0.1" &&
          !alias.internal
        )
          return alias.address;
      }
    }
    return "0.0.0.0";
  }
}

function getURL(host, port) {
  if (host === "127.0.0.1") return `http://${host}:${port}/`;
  const ip = getIPAddress();
  return `http://${ip}:${port}/`;
}

function createQR(url) {
  // QR codes for login, url is http://local_ip:port/login
  const qrcode = require("qrcode");
  url += "login";
  if (!fs.existsSync(qrPath)) fs.mkdirSync(qrPath);
  qrcode.toFile(qrPath + "/qr.png", url, {
    width: 150,
    height: 150,
  });
  qrcode.toFile(qrPath + "/qr_small.png", url, {
    width: 100,
    height: 100,
    margin: 0,
  });
}

function createTextQR(text, index = 0) {
  const qrcode = require("qrcode");
  if (!fs.existsSync(tempQrPath)) fs.mkdirSync(tempQrPath);
  return qrcode.toFile(tempQrPath + `/temp_qr${index}.png`, text, {
    width: 500,
    height: 500,
  });
}

function saveFile(file, fileName = undefined) {
  const saveDir = path.join(__dirname, "upload-temp");
  if (!fileName) fileName = file.name;
  if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir);
  file.mv(`${saveDir}/${fileName}`);
}

function clearTemp() {
  if (fs.existsSync(tempQrPath)) {
    fs.readdirSync(tempQrPath).forEach((file, index) => {
      const curPath = `${tempQrPath}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(tempQrPath);
  }
}

module.exports = { getURL, createQR, createTextQR, saveFile, clearTemp };
