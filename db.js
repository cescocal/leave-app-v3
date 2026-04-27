const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// FIX: Always use absolute path so Render does NOT create a second DB
const dbPath = path.join(__dirname, "database.sqlite");

console.log("Using SQLite DB at:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  // Users table (updated schema)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT,
      active INTEGER DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error("Error creating users table:", err);
    } else {
      console.log("Users table ready");
    }
  });

  // Default admin user (safe insert)
  db.run(`
    INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, active)
    VALUES (
      1,
      'admin',
      '$2b$10$u1x0xJ7p8eQfZqVQ0qzMeOqY8FJwB6g7xYg8YxJ7p8eQfZqVQ0qzMe',
      'admin',
      'Administrator',
      1
    )
  `);

  // Leave requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error("Error creating leave_requests table:", err);
    } else {
      console.log("Leave requests table ready");
    }
  });
});

module.exports = db;
