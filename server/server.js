const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const utils = require("./utils/utils");
const { ROOT } = require("./utils/constants");

const args = process.argv.slice(2);
const { host, port } = utils.getHostPort(args?.[0]);
const privateURL = utils.getPrivateURL(host, port);

let textList = ["", "", ""];
utils.createQR(privateURL);

app.set("view engine", "ejs");
app.set("views", `${ROOT}/views`);
app.use(express.static(`${ROOT}/static`));
app.use(require("express-fileupload")());
app.use(express.json());

http.listen(port, host, () => utils.onInitHandler(privateURL));

// shared variables
app.use((req, res, next) => {
  req.io = io;
  req.textList = textList;
  next();
});

app.use((req, res, next) => {
  const test = /\?[^]*\//.test(req.url);
  if (req.url.substr(-1) === '/' && req.url.length > 1 && !test)
    res.redirect(301, req.url.slice(0, -1));
  else
    next();
});
app.use("/upload", require("./routes/upload"));
app.use("/s", require("./routes/saved"));
app.use("/api", require("./routes/api"));
app.use("/", require("./routes/syncpad")); // keep at bottom for fallback

io.on("connection", (socket) => {
  console.log(
    `[${new Date().toISOString()}] ${
      socket.handshake.headers["x-forwarded-for"] || socket.conn.remoteAddress
    } connected`
  );
  socket.emit("update all textarea", textList);
  socket.on("sync text", (text, index) => {
    textList[index] = text;
    // send to all except requester
    socket.broadcast.emit("update textarea", text, index);
  });

  // generate on server side for longer max char length
  socket.on("generate qr", (index) => {
    const chunks = [],
      len = 777;
    let i = 0;
    while (i < textList[index].length) {
      chunks.push(textList[index].substring(i, i + len));
      i += len;
    }

    Promise.all(chunks.map((chunk, i) => utils.createTextQR(chunk, i)))
      .then(() => {
        console.log(chunks.length, "QR created");
        io.emit("qr ready", chunks.length);
      })
      .catch((e) => {
        console.log("error", e);
      });
  });
});

process.on("SIGINT", () => utils.onExitHandler());
