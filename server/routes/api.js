const router = require("express").Router();

const normalizeIndex = (id) => {
  if (!id || id < 1 || id > 3) id = 1;
  return id - 1;
};

router.get("/get/:id?", function (req, res) {
  console.log(
    `[${new Date().toISOString()}] ${
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    } /api/get/${req.params.id}`
  );
  res.send(
    req.textList[normalizeIndex(req.params.id)].split("\n").join("<br>")
  );
});

router.get("/get_text", function (req, res) {
  res.redirect("/api/get/1");
});

const appendAPIRegex = /^\/append\/(\d+)\/(.+)$/;
router.get(appendAPIRegex, function (req, res) {
  const [_, id, text] = req.url.match(appendAPIRegex);
  console.log(
    `[${new Date().toISOString()}] ${
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    } /api/append/${id}`
  );
  const index = normalizeIndex(id);
  req.textList[index] += "\n" + text;
  req.io.emit("update textarea", req.textList[index], index);
  res.send(req.textList[index].split("\n").join("<br>"));
});

module.exports = router;
