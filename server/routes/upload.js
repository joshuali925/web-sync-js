const router = require("express").Router();
const { ROOT } = require("../utils/constants");
const utils = require("../utils/utils");

router.get("/", function (req, res) {
  res.render("index", {
    page: `${ROOT}/views/partials/upload`,
  });
});

router.post("/", function (req, res) {
  utils.log(req, "POST /upload");
  if (req.files) {
    const files = req.files.file;
    if (files.length) {
      // if multiple files uploaded
      files.forEach((file) => utils.saveFile(file));
    } else {
      utils.saveFile(files);
    }
  }
  res.redirect("/upload");
});

module.exports = router;
