const db = require('../config/db');

// Fetch member detial
const getMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const [member] = await db.query(
      `SELECT m.MemberID, m.DisplayName, m.UserName, m.Email, m.Major, m.GraduationYear, m.AcademicYear,
              o.Name AS OrganizationName, om.Role AS MemberRole,
              CASE 
                WHEN SUM(mp.PointsEarned) >= 18 THEN 'Active'
                ELSE 'Inactive'
              END AS MembershipStatus
       FROM Members m
       JOIN OrganizationMembers om ON m.MemberID = om.MemberID
       JOIN Organizations o ON om.OrganizationID = o.OrganizationID
       LEFT JOIN MemberPoints mp ON m.MemberID = mp.MemberID
       WHERE m.MemberID = ?`, 
      [id]
    );

    res.status(200).json(member[0] || { message: 'Member not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch attendance records
const getMemberAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const [records] = await db.query(
      `SELECT e.EventTitle, e.EventType, e.EventDate, a.CheckInTime,
              CASE 
                WHEN e.EventType = 'Volunteer Event' THEN a.VolunteerHours
                ELSE NULL
              END AS VolunteerHours
       FROM Attendance a
       JOIN Events e ON a.EventID = e.EventID
       WHERE a.MemberID = ?
       ORDER BY e.EventDate DESC`, 
      [id]
    );

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch earned points
const getMemberPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const [points] = await db.query(
      `SELECT ActivityName, SUM(PointsEarned) AS TotalPoints, SUM(TotalHours) AS TotalVolunteerHours
       FROM MemberPoints
       WHERE MemberID = ?
       GROUP BY ActivityName`, 
      [id]
    );

    res.status(200).json(points);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMemberProfile, getMemberAttendance, getMemberPoints };