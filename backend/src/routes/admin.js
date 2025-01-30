const express = require('express');
const cors = require('cors');
const db = require('./config/db.js');

const app = express();
app.use(cors());
app.use(express.json());

// endpoint to fetch data for the table
app.get('/datatable', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT'); // i need to figure out the right query
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});