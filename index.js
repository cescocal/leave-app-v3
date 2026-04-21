require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const SECRET = process.env.SECRET;

const app = express();

app.use(cors());
app.use(express.json());

/* -----------------------------
   AUTH MIDDLEWARE
------------------------------ */

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function adminRequired(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}

function adminOrSupervisorRequired(req, res, next) {
  if (req.user.role === "admin" || req.user.role === "supervisor") {
    return next();
  }
  return res.status(403).json({ error: "Admin or supervisor access only" });
}

/* -----------------------------
   TEST ROUTE
------------------------------ */

app.get("/protected", authRequired, (req, res) => {
  res.json({ message: "You are logged in!", user: req.user });
});

/* -----------------------------
   LOGIN
------------------------------ */

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!match) return res.status(401).json({ error: "Invalid username or password" });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET,
        { expiresIn: "8h" }
      );

      res.json({ token });
    });
  });
});

/* -----------------------------
   ADMIN: CREATE USER
------------------------------ */

app.post("/admin/users", authRequired, adminRequired, (req, res) => {
  const { username, password, role, full_name, supervisor_id } = req.body;

  if (!username || !password || !role || !full_name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: "Server error" });

    db.run(
      "INSERT INTO users (username, password_hash, role, full_name, active, supervisor_id) VALUES (?, ?, ?, ?, 1, ?)",
      [username, hash, role, full_name, supervisor_id || null],
      function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "Username already exists" });
          }
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          message: "User created successfully",
          user: {
            id: this.lastID,
            username,
            role,
            full_name,
            active: 1,
            supervisor_id: supervisor_id || null
          }
        });
      }
    );
  });
});

/* -----------------------------
   ADMIN: GET ALL USERS
------------------------------ */

app.get("/admin/users", authRequired, adminRequired, (req, res) => {
  db.all(
    "SELECT id, username, role, full_name, active, supervisor_id FROM users ORDER BY full_name ASC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    }
  );
});

/* -----------------------------
   ADMIN + SUPERVISOR: UPDATE USER
------------------------------ */

app.put("/admin/users/:id", authRequired, adminOrSupervisorRequired, (req, res) => {
  const { full_name, role, supervisor_id } = req.body;
  const userId = req.params.id;

  if (!full_name || !role)
    return res.status(400).json({ error: "Full name and role are required" });

  if (req.user.role === "supervisor") {
    db.get("SELECT supervisor_id FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (!row || row.supervisor_id !== req.user.id) {
        return res.status(403).json({ error: "You can only edit your own staff" });
      }

      db.run(
        "UPDATE users SET full_name = ?, role = ?, supervisor_id = ? WHERE id = ?",
        [full_name, role, supervisor_id || null, userId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          if (this.changes === 0) return res.status(404).json({ error: "User not found" });
          res.json({ message: "User updated successfully" });
        }
      );
    });

    return;
  }

  db.run(
    "UPDATE users SET full_name = ?, role = ?, supervisor_id = ? WHERE id = ?",
    [full_name, role, supervisor_id || null, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User updated successfully" });
    }
  );
});

/* -----------------------------
   EMPLOYEE: SUBMIT LEAVE REQUEST
------------------------------ */

app.post("/leave", authRequired, (req, res) => {
  const { start_date, end_date, leave_type, reason } = req.body;

  if (!start_date || !end_date || !leave_type) {
    return res.status(400).json({ error: "Start date, end date, and leave type are required" });
  }

  db.run(
    `INSERT INTO leave_requests (user_id, start_date, end_date, leave_type, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, start_date, end_date, leave_type, reason || ""],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });

      res.json({
        message: "Leave request submitted",
        request: {
          id: this.lastID,
          user_id: req.user.id,
          start_date,
          end_date,
          leave_type,
          reason
        }
      });
    }
  );
});

/* -----------------------------
   EMPLOYEE: VIEW OWN LEAVE
------------------------------ */

app.get("/staff/leave", authRequired, (req, res) => {
  db.all(
    `
    SELECT lr.*, u.full_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    WHERE lr.user_id = ?
    ORDER BY lr.start_date DESC
    `,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ requests: rows });
    }
  );
});

/* -----------------------------
   SUPERVISOR: VIEW OWN + TEAM LEAVE
------------------------------ */

app.get("/supervisor/leave", authRequired, (req, res) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ error: "Supervisors only" });
  }

  const supervisorId = req.user.id;

  db.all(
    `
    SELECT lr.*, u.full_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    WHERE lr.user_id = ?
       OR u.supervisor_id = ?
    ORDER BY lr.start_date DESC
    `,
    [supervisorId, supervisorId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ requests: rows });
    }
  );
});

/* -----------------------------
   ADMIN: VIEW ALL LEAVE (with filters)
------------------------------ */

app.get("/admin/leave", authRequired, adminRequired, (req, res) => {
  let query = `
    SELECT lr.*, u.full_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    WHERE 1 = 1
  `;
  const params = [];

  if (req.query.user_id) {
    query += " AND lr.user_id = ?";
    params.push(req.query.user_id);
  }

  if (req.query.type) {
    query += " AND lr.leave_type = ?";
    params.push(req.query.type);
  }

  if (req.query.status) {
    query += " AND lr.status = ?";
    params.push(req.query.status);
  }

  if (req.query.from) {
    query += " AND lr.start_date >= ?";
    params.push(req.query.from);
  }

  if (req.query.to) {
    query += " AND lr.end_date <= ?";
    params.push(req.query.to);
  }

  query += " ORDER BY lr.start_date DESC";

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ requests: rows });
  });
});

/* -----------------------------
   ADMIN + SUPERVISOR: APPROVE / REJECT
------------------------------ */

app.put("/admin/leave/:id", authRequired, adminOrSupervisorRequired, (req, res) => {
  const { status } = req.body;
  const leaveId = req.params.id;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  if (req.user.role === "supervisor") {
    db.get(
      `
      SELECT u.supervisor_id
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE lr.id = ?
      `,
      [leaveId],
      (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (!row || row.supervisor_id !== req.user.id) {
          return res.status(403).json({ error: "You can only update your own staff" });
        }

        db.run(
          "UPDATE leave_requests SET status = ? WHERE id = ?",
          [status, leaveId],
          function (err) {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "Leave updated successfully" });
          }
        );
      }
    );

    return;
  }

  db.run(
    "UPDATE leave_requests SET status = ? WHERE id = ?",
    [status, leaveId],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Leave updated successfully" });
    }
  );
});

/* -----------------------------
   STAFF: LEAVE SUMMARY
------------------------------ */

app.get("/staff/leave/summary", authRequired, (req, res) => {
  const userId = req.user.id;

  db.all(
    `
    SELECT start_date, end_date, status
    FROM leave_requests
    WHERE user_id = ?
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });

      let totalDaysUsed = 0;
      let pendingCount = 0;

      rows.forEach((r) => {
        if (!r.status || r.status === "pending") pendingCount++;

        if (r.status === "approved") {
          const start = new Date(r.start_date);
          const end = new Date(r.end_date);
          const diff = Math.floor((end - start) / 86400000) + 1;
          totalDaysUsed += diff;
        }
      });

      res.json({
        total_days_used: totalDaysUsed,
        pending_requests: pendingCount,
      });
    }
  );
});

/* -----------------------------
   SUPERVISOR: LEAVE SUMMARY (Correct Version)
------------------------------ */

app.get("/supervisor/leave/summary", authRequired, (req, res) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ error: "Supervisors only" });
  }

  const supervisorId = req.user.id;

  db.all(
    `
    SELECT lr.*, u.full_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    WHERE lr.user_id = ?
       OR u.supervisor_id = ?
    ORDER BY lr.start_date DESC
    `,
    [supervisorId, supervisorId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const pending = rows.filter(
        r => (!r.status || r.status === "pending") && r.user_id !== supervisorId
      ).length;

      res.json({
        pending_requests: pending,
        staff_requests: rows
      });
    }
  );
});

/* -----------------------------
   ADMIN CALENDAR ROUTE
------------------------------ */

app.get("/admin/calendar", authRequired, adminRequired, (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: "Year and month required" });
  }

  db.all(
    `
    SELECT lr.*, u.full_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    WHERE lr.status = 'approved'
      AND strftime('%Y', lr.start_date) = ?
      AND strftime('%m', lr.start_date) = ?
    ORDER BY lr.start_date ASC
    `,
    [String(year), String(month).padStart(2, "0")],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ events: rows });
    }
  );
});

/* -----------------------------
   ROOT ROUTE (must be BEFORE catch-all)
------------------------------ */

app.get("/", (req, res) => res.send("API running"));

/* -----------------------------
   SERVE REACT FRONTEND
------------------------------ */

const path = require("path");
app.use(express.static(path.join(__dirname, "dist")));

/* -----------------------------
   SPA CATCH-ALL (Express 5 compatible)
------------------------------ */

app.get('/:path(*)', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

/* -----------------------------
   START SERVER
------------------------------ */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
