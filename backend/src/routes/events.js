const express = require('express');
const db = require('../config/db');

const router = express.Router();

const requireAuth = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
}
router.use(requireAuth);

router.get('/', async (req, res) => {
    console.log('Received request at /events');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer
    let semesterID = parseInt(req.query.semesterID, 10); // Get and convert semesterID
    
    if (isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid organizationID parameter' });
    }
    
    if (isNaN(semesterID)) {
        return res.status(400).json({ error: 'Invalid or missing semesterID parameter' });
    }

    try {
        const query = `
            SELECT 
                EventType, EventTypeID
            FROM 
                EventTypes
            WHERE 
                OrganizationID = ? AND
                SemesterID = ?
        `;
        const [rows] = await db.query(query, [organizationID, semesterID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Events data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;