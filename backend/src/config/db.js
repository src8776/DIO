const mysql = require('mysql2/promise'); // Ensure you are using promise-based mysql2

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
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connected to the database');
    
    // Run a simple test query
    const [rows] = await connection.query('SHOW TABLES');
    console.log('✅ Test query result:', rows);
    
    connection.release();
} catch (err) {
    console.error('❌ Database connection error:', err);
}
})();

module.exports = db;

