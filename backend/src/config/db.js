const mysql = require('mysql2/promise'); // Ensure you are using promise-based mysql2
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
  
  // Connect to the database
  db.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return;
      }
      console.log('Connected to the database');
      connection.release();
  });

module.exports = db;

