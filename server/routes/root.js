const router = require("express").Router();
const db = require("../utils/db");
const utils = require("../utils/utils");
const { ROOT } = require("../utils/constants");

router.get("/", (req, res) => {
  res.render("index", {
    page: `${ROOT}/views/partials/syncpad`,
  });
});

router.get(["/:key", "/s/:key"], (req, res) => {
  utils.log(req, "GET /s/" + req.params.key);
  db.getByKey(req.params.key)
    .then((resp) => {
      if (resp.isURL) res.redirect(resp.value);
      else
        res.render("index", {
          page: `${ROOT}/views/partials/paste`,
        });
      db.incrementCounter(req.params.key);
    })
    .catch((error) => {
      res.sendStatus(404);
    });
});

module.exports = router;
