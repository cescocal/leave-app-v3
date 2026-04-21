const bcrypt = require("bcrypt");
const db = require("./db");

// Change these if you want a different default admin login
const username = "admin";
const password = "admin123"; 
const role = "admin";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    process.exit(1);
  }

  db.run(
    "INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)",
    [username, hash, role],
    (err) => {
      if (err) {
        console.error("Error inserting admin user:", err);
      } else {
        console.log("Admin user created or already exists");
      }
      process.exit();
    }
  );
});
