const fs = require("fs");
const qrcode = require("qrcode");
const { ROOT } = require("./constants");

const imagesPath = `${ROOT}/static/images`;
const tempContentQRPath = `${ROOT}/static/images/temp`;

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

function getPrivateIPAddress() {
  const interfaces = require("os").networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        /4/.test(alias.family) &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
  return "0.0.0.0";
}

function log(...args) {
  let msg = `[${new Date().toISOString()}]`;
  if (typeof args[0] === "object") {
    const ip =
      args[0]?.headers?.["x-forwarded-for"] ||
      args[0]?.socket?.remoteAddress ||
      args[0]?.handshake?.headers?.["x-forwarded-for"] ||
      args[0]?.conn?.remoteAddress;
    if (ip) {
      msg += `[${ip}]`;
      [, ...args] = args;
    }
  }
  console.log(msg, ...args);
}

function logError(...args) {
  let msg = `[${new Date().toISOString()}]`;
  console.error(msg, ...args);
}

function getHostPort(arg) {
  const host = "127.0.0.1";
  const port = 18888;
  if (arg == null) return { host, port };
  const splitted = arg.split(":");
  if (splitted.length === 2)
    return { host: splitted[0], port: parseInt(splitted[1]) };
  if (splitted[0] === "localhost" || splitted[0].includes("."))
    return { host: splitted[0], port };
  return { host, port: parseInt(splitted[0]) };
}

function getPrivateURL(host, port) {
  if (host === "0.0.0.0") return `http://${getPrivateIPAddress()}:${port}/`;
  return `http://${host}:${port}/`;
}

function createQR(url) {
  if (!fs.existsSync(imagesPath)) fs.mkdirSync(imagesPath, { recursive: true });
  qrcode.toFile(imagesPath + "/qr.png", url, {
    width: 150,
    height: 150,
  });
  qrcode.toFile(imagesPath + "/qr_small.png", url, {
    width: 100,
    height: 100,
    margin: 0,
  });
}

function createTextQR(text, index = 0) {
  if (!fs.existsSync(tempContentQRPath))
    fs.mkdirSync(tempContentQRPath, { recursive: true });
  return qrcode.toFile(tempContentQRPath + `/temp_qr${index}.png`, text, {
    width: 500,
    height: 500,
  });
}

function saveFile(file, fileName = undefined) {
  const saveDir = `${ROOT}/data/uploads`;
  if (!fileName) fileName = file.name;
  if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
  file.mv(`${saveDir}/${fileName}`);
}

function onInitHandler(privateURL) {
  console.log(`[${new Date().toISOString()}] server running on ${privateURL}`);
  if (!/localhost:|127.0.0.1:/.test(privateURL))
    require("qrcode-terminal").generate(privateURL);
}

function onExitHandler() {
  console.log("Deleting temp QRs, exiting...");
  if (fs.existsSync(tempContentQRPath)) {
    fs.readdirSync(tempContentQRPath).forEach((file) => {
      const curPath = `${tempContentQRPath}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(tempContentQRPath);
  }
  process.exit();
}

module.exports = {
  createQR,
  createTextQR,
  getHostPort,
  getPrivateURL,
  log,
  logError,
  onExitHandler,
  onInitHandler,
  saveFile,
  validURL,
};
