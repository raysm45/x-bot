const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "warns.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log("[DB ERROR]", err.message);
  } else {
    console.log("[DB] Terhubung ke", dbPath);
  }
});

// BUAT TABLE
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS warns (
      user_id TEXT,
      guild_id TEXT,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, guild_id)
    )
  `);
});

module.exports = db;
