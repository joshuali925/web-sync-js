/*
 * # to check sqlite database
 * venv && pip install litecli
 * venv/bin/litecli data/sqlite3.db
 */

const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { ROOT } = require("../utils/constants");

const dataDir = `${ROOT}/data`;
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new sqlite3.Database(`${dataDir}/sqlite3.db`);

db.run(`CREATE TABLE IF NOT EXISTS shortened (
    key TEXT PRIMARY KEY NOT NULL,
    dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    value TEXT NOT NULL,
    isURL INTEGER DEFAULT 0,
    isVisible INTEGER DEFAULT 1,
    hits INTEGER DEFAULT 0)`);

async function generateKey() {
  for (let i = 0; i < 10; i++) {
    const uid = Math.random().toString(36).substring(2, 8);
    const present = await getByKey(uid).then((resp) => resp);
    if (!present) {
      return uid;
    }
  }
  throw Error("Could not generate a unique key.");
}

function insert(key, value, isURL = false, isVisible = true) {
  return promiseWrapper(async (resultHandler) => {
    if (!key) key = await generateKey();
    return db.run(
      "INSERT OR REPLACE INTO shortened (key, value, isURL, isVisible) VALUES (?, ?, ?, ?)",
      [key, value, isURL, isVisible],
      resultHandler
    );
  })
    .then(() => ({ key }))
    .catch((error) => ({ error }));
}

function promiseWrapper(callback) {
  return new Promise((resolve, reject) => {
    callback((err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function get(sql, params) {
  return promiseWrapper((resultHandler) => db.get(sql, params, resultHandler));
}

function getByKey(key) {
  return promiseWrapper((resultHandler) =>
    db.get(
      "select value, isURL from shortened where key = ?",
      key,
      resultHandler
    )
  );
}

function incrementCounter(key) {
  return promiseWrapper((resultHandler) =>
    db.run(
      "UPDATE shortened SET hits = hits + 1 WHERE key = ?",
      key,
      resultHandler
    )
  );
}

function getVisibles() {
  return promiseWrapper((resultHandler) =>
    db.all(
      "select key, dateCreated, value, isURL, hits from shortened where isVisible = 1 order by dateCreated desc",
      undefined,
      resultHandler
    )
  );
}

function deleteRow(key) {
  console.log('❗delete key:', key);
  return promiseWrapper((resultHandler) =>
    db.run(
      "delete from shortened where key = ?",
      key,
      resultHandler
    )
  )
    .then(() => ({ key }))
    .catch((error) => ({ error }));
}

function all(sql, params) {
  return promiseWrapper((resultHandler) => db.all(sql, params, resultHandler));
}

function each(sql, params) {
  return promiseWrapper((resultHandler) => db.each(sql, params, resultHandler));
}

function close() {
  db.close();
}

/* db.serialize(function () {
  insert("a", "hi", true, false);
  insert("b", "hi");
  // get("select * from shortened where key = 'a'").then((a) => console.log(a));
  getByKey("b").then((a) => console.log(a));
  each("select * from shortened where isVisible = 1").then((a) => {
    console.log("❗a:", a);
    return console.log(a);
  });
  all("select * from shortened").then((a) => console.log(a));
}); */

module.exports = {
  all,
  close,
  deleteRow,
  each,
  get,
  getByKey,
  getVisibles,
  incrementCounter,
  insert,
};
