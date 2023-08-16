require('dotenv').config;
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSERNAME,
  database: process.env.DBDATABASE, 
  password: process.env.DBPASSWORD,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;