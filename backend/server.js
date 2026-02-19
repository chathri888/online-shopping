const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// --- Database Connection with Auto-Reconnect ---
let db;

function connectToDatabase() {
  db = mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'shopdb'
  });

  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      console.log("Retrying in 5 seconds...");
      setTimeout(connectToDatabase, 5000);
    } else {
      console.log("Connected to MySQL");
      createUsersTable();
    }
  });

  db.on('error', (err) => {
    console.error("Database error:", err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log("Reconnecting to database...");
      connectToDatabase();
    }
  });
}

// --- Auto-create users table ---
function createUsersTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `;
  db.query(query, (err) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Users table ready");
    }
  });
}

// --- Routes ---

// Health check
app.get('/', (req, res) => {
  res.json({ status: "Backend running" });
});

// Register
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
    (err, result) => {
      if (err) {
        console.error("Register error:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: "Email already registered" });
        }
        return res.status(500).json({ message: "Registration failed" });
      }
      res.json({ message: "User registered successfully" });
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (results.length > 0) {
        res.json({ success: true, message: "Login successful" });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  );
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

connectToDatabase();
