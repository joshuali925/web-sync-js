const router = require("express").Router();
const { ROOT } = require("../utils/constants");

router.get("/", (req, res) => {
  res.render("index", {
    page: `${ROOT}/views/partials/syncpad`,
  });
});

module.exports = router;
