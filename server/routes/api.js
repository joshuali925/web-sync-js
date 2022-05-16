const router = require("express").Router();
const db = require("../utils/db");
const utils = require("../utils/utils");

const normalizeIndex = (id) => {
  if (!id || id < 1 || id > 3) id = 1;
  return id - 1;
};

router.get("/get/:id?", function (req, res) {
  utils.log(req, "GET /api/get/" + req.params.id);
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
  utils.log(req, "GET /api/append/" + id);
  const index = normalizeIndex(id);
  req.textList[index] += "\n" + text;
  req.io.emit("update textarea", req.textList[index], index);
  res.send(req.textList[index].split("\n").join("<br>"));
});

router.post("/save", async function (req, res) {
  utils.log(req, "POST /api/save, key=" + req.body.key);
  const index = req.body.id;
  const key = req.body.key;
  const value = req.textList[index];
  const description = req.body.description;
  const isURL = utils.validURL(value);
  const isPublic = req.body.isPublic;
  const resp = await db.insert(key, value, description, isURL, isPublic);
  res.send(resp);
});

router.get("/save", async function (req, res) {
  utils.log(req, "GET /api/save");
  const resp = await db.getPublics();
  for (let i = 0; i < resp.length; i++) {
    const item = resp[i];
    if (!item.isURL && item.value.length > 30) {
      item.value = item.value.substring(0, 30) + "...";
    }
  }
  res.send(resp);
});

router.get("/save/:key", async function (req, res) {
  utils.log(req, "GET /api/save/" + req.params.key);
  const resp = await db.getByKey(req.params.key);
  res.send(resp);
});

router.delete("/save/:key", async function (req, res) {
  utils.log(req, "DELETE /api/save/" + req.params.key);
  const key = req.params.key;
  const resp = await db.deleteRow(key);
  res.send(resp);
});

module.exports = router;
