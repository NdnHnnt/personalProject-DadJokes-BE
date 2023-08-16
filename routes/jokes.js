const { Router } = require("express");
const nanoid = require("nanoid-esm");
const moment = require("moment");
require("dotenv").config();

const { authenticateToken, authenticateHeader } = require("./middleware");

const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = Router();
const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

router.get("/", [authenticateToken], async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT jokes.jokes_id,
        jokes.jokes_question,
        jokes.jokes_answer,
        user.user_name AS author,
        COUNT(comment.comment_id) AS comment_count,
        COUNT(likes.likes_id) AS like_count
        FROM jokes
        LEFT JOIN comment ON jokes.jokes_id = comment.comment_joke
        LEFT JOIN likes ON jokes.jokes_id = likes.likes_joke
        LEFT JOIN user ON user.user_id = jokes.jokes_user
        GROUP BY jokes.jokes_id`
    );
    const jokes = rows;
    res.status(200).json({
      status: 200,
      data: jokes,
    });
  } catch (error) {
    console.error("Error retrieving jokes:", error);
    res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

router.post("/", [authenticateToken], async (req, res) => {
  try {
    const { email } = req.response;
    const { question, answer } = req.body;
    const jokeId = nanoid(8); // Generate a unique ID for the post
    const jokeTime = moment();

    let userId;
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM user WHERE user_email = ? ", [email]);
    userId = rows[0].user_id;
    await pool
      .promise()
      .query(
        "INSERT INTO jokes (jokes_id, jokes_question, jokes_answer, jokes_user, jokes_timestamp) VALUES (?, ?, ?, ?, ?)",
        [jokeId, question, answer, userId, currentDate]
      );

    const queryResult = await pool
      .promise()
      .query(
        "SELECT jokes_id, jokes_question, jokes_answer FROM jokes WHERE jokes_id = ? LIMIT 1",
        [jokeId]
      );
    const result = queryResult[0][0];

    res.status(200).json({
      status: 200,
      msg: "Jokes created",
      data: result,
    });
  } catch (error) {
    console.error("Error creating community post:", error);
    res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

router.get("/:jokesId", [authenticateToken], async (req, res) => {
  const { email } = req.response;
  try {
    const { jokesId } = req.params;
    let userId;
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM user WHERE user_email = ? ", [email]);
    userId = rows[0].user_id;
    const [jokesRows] = await pool.promise().query(
      `SELECT
              jokes.jokes_timestamp,
              jokes.jokes_question,
              jokes.jokes_answer,
              u.user_name AS author,
              COUNT(DISTINCT likes.likes_id) AS like_count,
              COUNT(DISTINCT comment.comment_id) AS comment_count,
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'comment_id', c.comment_id,
                    'username', u.user_name,
                    'timestamp', c.comment_timestamp,                    
                    'comment', c.comment_content 
                  )
                )
                FROM comment AS c
                LEFT JOIN user AS u ON c.comment_user = u.user_id
                WHERE c.comment_joke = jokes.jokes_id
                ORDER BY c.comment_timestamp
              ) AS comments
            FROM jokes
            LEFT JOIN user AS u ON jokes.jokes_user = u.user_id
            LEFT JOIN comment ON jokes.jokes_id = comment.comment_joke
            LEFT JOIN likes ON jokes.jokes_id = likes.likes_joke
            WHERE jokes.jokes_id = ?
            GROUP BY jokes.jokes_id`,
      [jokesId]
    );

    const jokesPost = jokesRows;
    return res.status(200).json({
      status: 200,
      data: jokesPost,
    });
  } catch (error) {
    console.error("Error fetching community post:", error);
    res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

router.post("/:jokesId/like", [authenticateToken], async (req, res) => {
  const { email } = req.response;
  try {
    const { jokesId } = req.params;
    let userId;

    const [rows1] = await pool
      .promise()
      .query("SELECT * FROM user WHERE user_email = ? ", [email]);
    userId = rows1[0].user_id;

    const [rows2] = await pool
      .promise()
      .query(
        "SELECT COUNT(*) AS count FROM likes WHERE likes_user = ? AND likes_joke = ?",
        [userId, jokesId]
      );
    const count = rows2[0].count;
    if (count > 0) {
      await pool
        .promise()
        .query("DELETE FROM likes WHERE likes_user = ? AND likes_joke = ?", [
          userId,
          jokesId,
        ]);
      return res.status(200).json({
        status: 200,
        msg: "Jokes unliked.",
      });
    } else {
      await pool
        .promise()
        .query(
          "INSERT INTO likes (likes_id, likes_user, likes_joke) VALUES (?, ?, ?)",
          [nanoid(8), userId, jokesId]
        );
      res.status(200).json({
        status: 200,
        msg: "Joke liked",
      });
    }
  } catch (error) {
    console.error("Error liking joke:", error);
    res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

router.post("/:jokesId/comment", [authenticateToken], async (req, res) => {
  const { email } = req.response;
  try {
    const { jokesId } = req.params;
    let userId;
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM user WHERE user_email = ? ", [email]);
    userId = rows[0].user_id;

    await pool
      .promise()
      .query(
        "INSERT INTO comment (comment_id, comment_content, comment_joke,  comment_user, comment_timestamp) VALUES (?, ?, ?, ?, ?)",
        [nanoid(8), comment, jokesId, userId, currentDate]
      );

    res.status(200).json({
      status: 200,
      msg: "Comment added",
    });
  } catch (error) {
    console.error("Error adding comment to jokes:", error);
    res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

// Define the DELETE endpoint
router.delete("/:jokesId", [authenticateToken], async (req, res) => {
  const { email } = req.response;

  try {
    const { jokesId } = req.params;

    // Fetch the user ID based on the email
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM user WHERE user_email = ? ", [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 404,
        msg: "User not found",
      });
    }

    const userId = rows[0].user_id;

    // Check if the user owns the joke before deleting it
    const [rows2] = await pool
      .promise()
      .query(
        "SELECT COUNT(*) AS jokeCount FROM jokes WHERE jokes_id = ? AND jokes_user = ?",
        [jokesId, userId]
      );

    const jokeCount = rows2[0].jokeCount;

    if (jokeCount >= 1) {

      await pool
        .promise()
        .query("DELETE FROM jokes WHERE jokes_id = ?", [jokesId]);

      await pool
        .promise()
        .query("DELETE FROM comment WHERE comment_joke = ?", [jokesId]);

      await pool
        .promise()
        .query("DELETE FROM likes WHERE likes_joke = ?", [jokesId]);

      res.status(200).json({
        status: 200,
        msg: "Joke deleted",
      });
    } else {
      return res.status(401).json({
        status: 401,
        msg: "You do not have permission to delete this joke",
      });
    }
  } catch (error) {
    console.error("Error deleting joke: ", error);
    res.status(500).json({
      status: 500,
      msg: "Server error",
    });
  }
});

module.exports = router;

router.delete(
  "/:jokesId/comment/:commentId",
  [authenticateToken],
  async (req, res) => {
    const { email } = req.response;
    try {
      const { jokesId, commentId } = req.params;
      const { comment } = req.body;
      let userId;
      const [rows] = await pool
        .promise()
        .query("SELECT * FROM user WHERE user_email = ? ", [email]);
      userId = rows[0].user_id;

      const [rows2] = await pool
        .promise()
        .query(
          "SELECT COUNT(*) FROM comment WHERE comment_id = ? AND comment_user =? AND comment_joke = ?",
          [commentId, userId, jokesId]
        );

      var count = rows2[0].count;
      if (!count) {
        return res.status(400).json({
          status: 401,
          msg: "Anda tidak memiliki hak untuk menghapus komentar ini",
        });
      }

      await pool
        .promise()
        .query("DELETE FROM comment WHERE comment_id = ?", [commentId]);

      res.status(200).json({
        status: 200,
        msg: "Comment deleted",
      });
    } catch (error) {
      console.error("Error deleting comment from jokes: ", error);
      res.status(500).json({
        status: 500,
        msg: "Server error",
      });
    }
  }
);

module.exports = router;
