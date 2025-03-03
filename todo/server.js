const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const PORT = 8086;

app.use(express.json());
app.use(cors());

// ✅ Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",  // Change if needed
  password: "",  // Change if needed
  database: "todo"
});

db.connect((err) => {
  if (err) {
    console.error("Database Connection Failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

// ✅ User Login API
app.post("/api/user/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt for username:", username);

  if (!username || !password) {
    return res.send({ status: false, message: "Username and password are required!" });
  }

  let sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (error, results) => {
    if (error) {
      console.error("SQL Error:", error);
      return res.send({ status: false, message: "Server error" });
    }

    console.log("Query results:", results);
    if (results.length === 0) {
      return res.send({ status: false, message: "Invalid username or password" });
    }

    const user = results[0];
    console.log("User found:", user);

    // 🔒 If passwords are stored in plain text (Not Recommended):
    // if (user.password === password) {

    // 🔒 If passwords are hashed with bcrypt:
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error("Bcrypt Error:", err);
        return res.send({ status: false, message: "Server error" });
      }

      if (match) {
        delete user.password; // Remove password before sending response
        return res.send({
          status: true,
          message: "Login successful",
          user: user
        });
      } else {
        return res.send({ status: false, message: "Invalid username or password" });
      }
    });
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
