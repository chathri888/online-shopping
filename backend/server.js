const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'shopdb'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

app.get('/', (req, res) => {
  res.send("Backend running");
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
    (err, result) => {
      if (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Registration failed" });
      }
      res.json({ message: "User registered successfully" });
    }
  );
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false });
      }

      if (results.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  );
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
