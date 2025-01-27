const mysql = require('mysql2');

// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, 
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