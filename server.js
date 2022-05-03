const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const open = require("open");
const path = require("path");
const util = require("./util");
const termQR = require("qrcode-terminal");

const args = process.argv.slice(2);
const { host, port } = util.getHostPort(args?.[0]);
const local_url = util.getURL(host, port);

// let logged_in = false;
let text_list = ["", "", ""];
util.createQR(local_url);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "static")));
app.use(fileUpload());

http.listen(port, host, function () {
  console.log(`[${new Date().toISOString()}] server running on ${local_url}`);
  // open(`http://localhost:${port}/`);
  if (host === "0.0.0.0") termQR.generate(local_url);
});

app.get("/", function (req, res) {
  // if (logged_in)
  res.render("index", {
    page: path.join(__dirname, "views", "partials", "syncpad"),
  });
  // else
  //     res.render('login');
});

const id_to_index = (id) => {
  if (!id || id < 1 || id > 3) id = 1;
  return id - 1;
};

app.get("/api/get/:id?", function (req, res) {
  console.log(
    `[${new Date().toISOString()}] ${
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    } /api/get/${req.params.id}`
  );
  res.send(text_list[id_to_index(req.params.id)].split("\n").join("<br>"));
});

app.get("/api/get_text", function (req, res) {
  res.redirect("/api/get/1");
});

const append_api_regex = /^\/api\/append\/(\d+)\/(.+)$/;
app.get(append_api_regex, function (req, res) {
  const [_, id, text] = req.url.match(append_api_regex);
  console.log(
    `[${new Date().toISOString()}] ${
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    } /api/append/${id}`
  );
  const index = id_to_index(id);
  text_list[index] += "\n" + text;
  io.emit("update textarea", text_list[index], index);
  res.send(text_list[index].split("\n").join("<br>"));
});

app.get("/login", (req, res) => {
  logged_in = true;
  io.emit("refresh");
  res.redirect("/");
});

app.get("/upload", (req, res) => {
  res.render("index", {
    page: path.join(__dirname, "views", "partials", "upload"),
  });
});

app.post("/upload", function (req, res) {
  if (req.files) {
    const files = req.files.file;
    if (files.length) {
      // if multiple files uploaded
      files.forEach((file) => util.saveFile(file));
    } else {
      util.saveFile(files);
    }
  }
  res.redirect("/upload");
});

io.on("connection", (socket) => {
  console.log(
    `[${new Date().toISOString()}] ${
      socket.handshake.headers["x-forwarded-for"] || socket.conn.remoteAddress
    } connected`
  );
  socket.emit("update all textarea", text_list);
  socket.on("sync text", (text, index) => {
    text_list[index] = text;
    socket.broadcast.emit("update textarea", text, index);
  });

  socket.on("generate qr", (index) => {
    const chunks = [],
      len = 777;
    let i = 0;
    while (i < text_list[index].length) {
      chunks.push(text_list[index].substring(i, i + len));
      i += len;
    }

    Promise.all(chunks.map((chunk, i) => util.createTextQR(chunk, i)))
      .then(() => {
        console.log(chunks.length, "QR created");
        io.emit("qr ready", chunks.length);
      })
      .catch((e) => {
        console.log("error", e);
      });
  });
});

process.on("SIGINT", function () {
  console.log("Deleting temp QRs, exiting...");
  util.clearTemp();
  process.exit();
});
