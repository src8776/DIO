const db = require('../config/db');

class DBHelper {
    static async runQuery(query, values = [], connection = null) {
        if (connection) {
            return connection.query(query, values); // Use existing transaction connection
        }

        const newConnection = await db.getConnection();
        try {
            return await newConnection.query(query, values);
        } finally {
            newConnection.release(); // Ensure release after execution
        }
    }
}

module.exports = DBHelper;