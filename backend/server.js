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
  database: 'shopping'
});

db.connect(err => {
  if (err) {
    console.log("DB error:", err);
  } else {
    console.log("MySQL Connected");
  }
});


// TEST ROUTE
app.get('/', (req, res) => {
  res.send("Backend API Running");
});


// REGISTER API
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
    (err, result) => {
      if (err) {
        res.status(500).json({ message: "Registration failed" });
      } else {
        res.json({ message: "User registered" });
      }
    }
  );
});


// LOGIN API
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (err) {
        res.status(500).json({ message: "Server error" });
      } else if (results.length > 0) {
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
