const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

async function getDb() {
  if (!db) {
    db = await open({
      filename: './server/db/db.sqlite',
      driver: sqlite3.Database
    });
  }
  return db;
}

module.exports = {
  all: async (sql, params = []) => {
    const database = await getDb();
    return database.all(sql, params);
  },
};