const bcrypt = require("bcrypt");
const { Router } = require("express");
const nanoid = require("nanoid-esm");
require("dotenv").config();

const { authenticateToken, authenticateHeader } = require("./middleware");

const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = Router();

router.get("/", [authenticateToken], async (req, res) => {
  const { email, username } = req.response;
  const [rows] = await pool
    .promise()
    .query("SELECT COUNT(*) AS count FROM user WHERE user_email = ?", [email]);
  const count = rows[0].count;
  if (count > 0) {
    const queryResult = await pool
      .promise()
      .query(
        `SELECT user_email, user_name FROM user WHERE user_email='${req.response.email}' LIMIT 1`
      );
    const result = queryResult[0][0];
    res.status(200).json({
      status: 200,
      data: result,
    });
  } else {
    res.status(300).json({
      status: 300,
      msg: "Please Log In or Sign Up using your account",
    });
  }
});

router.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const [rows] = await pool
      .promise()
      .query("SELECT COUNT(*) AS count FROM user WHERE user_email = ?", [
        email,
      ]);
    const count = rows[0].count;
    if (count > 0) {
      return res.status(400).json({
        status: 401,
        msg: "E-mail sudah terdaftar dalam sistem, mohon Sign In menggunakan e-mail yang sudah terdaftar.",
      });
    }
    const nanoidString = nanoid(8);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query =
      "INSERT INTO user (user_id, user_email, user_name, user_password) VALUES (?, ?, ?, ?)";
    await pool
      .promise()
      .query(query, [nanoidString, email, username, hashedPassword]);
    return res.status(200).json({
      status: 200,
      msg: "Akun telah dibuat, Selamat bergabung di komunitas dadJokes",
    });
  } catch (error) {
    console.error("Error executing query:", error);
    return res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM user WHERE user_email= ?", [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        status: 401,
        msg: "Invalid E-mail atau Password. Mohon Sign Up apabila belum memiliki akun.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.user_password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        msg: "Invalid E-mail atau Password. Mohon Sign Up apabila belum memiliki akun.",
      });
    }

    const queryResult = await pool
      .promise()
      .query(
        `SELECT user_email, user_name FROM user WHERE user_email='${email}' LIMIT 1`
      );
    const result = queryResult[0][0];
    const token = jwt.sign(
      {
        email: user.user_email
      },
      process.env.SECRETTOKEN,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      status: 200,
      msg: "Sign In success!",
      data: result,
      token: token,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    return res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

module.exports = router;
