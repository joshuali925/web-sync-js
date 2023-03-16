const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const utils = require("./utils/utils");
const { ROOT } = require("./utils/constants");
const db = require("./utils/db");

const args = process.argv.slice(2);
const { host, port } = utils.getHostPort(args?.[0]);
const privateURL = utils.getPrivateURL(host, port);

let textList = ["", "", ""];

db.init()
  .then(() =>
    Promise.allSettled([db.getByKey("0"), db.getByKey("1"), db.getByKey("2")])
  )
  .then((results) =>
    results.map((initValueResult, i) => {
      if (initValueResult.value != null) {
        textList[i] = initValueResult.value.value;
      } else {
        textList[i] = "";
        db.insert(`${i}`, "", "", false, false);
      }
    })
  );

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

app.use("/upload", require("./routes/upload"));
app.use("/s", require("./routes/saved"));
app.use("/api", require("./routes/api"));
app.use("/", require("./routes/root")); // keep at bottom for fallback

// https://stackoverflow.com/questions/32674391/io-emit-vs-socket-emit/40829919#40829919
io.on("connection", (socket) => {
  utils.log(socket, "client connected");
  io.emit("update user count", io.engine.clientsCount);
  socket.emit("update all textarea", textList);
  socket.on("sync text", (text, index) => {
    textList[index] = text;
    // send to all except requester
    socket.broadcast.emit("update textarea", text, index);
    db.updateValue(index, text);
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
        utils.log(socket, chunks.length, "QR created");
        io.emit("qr ready", chunks.length);
      })
      .catch((error) => {
        utils.logError(error);
      });
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("update user count", io.engine.clientsCount);
  });
});

process.on("SIGINT", () => utils.onExitHandler());
