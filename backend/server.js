const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "root",
  database: "shopdb"
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed");
  } else {
    console.log("Connected to MySQL");
  }
});

// Login API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {
      if (result.length > 0) {
        res.json({ message: "Login success" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    }
  );
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});

