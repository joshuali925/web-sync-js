const router = require("express").Router();
const db = require("../utils/db");
const utils = require("../utils/utils");
const { ROOT } = require("../utils/constants");

router.get("/", (req, res) => {
  res.render("index", {
    page: `${ROOT}/views/partials/saved`,
  });
});

module.exports = router;
