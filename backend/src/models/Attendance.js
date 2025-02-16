const db = require('../config/db');

class Attendance {
  static async insertAttendance(attendance, eventID, organizationID) {
    if (!eventID) {
      console.error("Cannot insert attendance: EventID is null");
      return;
    }

    try {
      const { email, checkInDate } = attendance;

      // Get MemberID
      const [rows] = await db.query(
        `SELECT MemberID FROM Members WHERE Email = ?`,
        [email]
      );

      if (rows.length === 0) {
        console.warn(`[@Attendance] No Member found with email: ${email}`);
        return;
      }

      const memberID = rows[0].MemberID;

      await db.query(
        `INSERT INTO Attendance (MemberID, EventID, CheckInTime, AttendanceStatus, AttendanceSource, OrganizationID)
           VALUES (?, ?, ?, 'Attended', 'CSV Import', ?)
           ON DUPLICATE KEY UPDATE AttendanceStatus = VALUES(AttendanceStatus);`,
        [memberID, eventID, checkInDate, organizationID]
      );
      //for logs
      console.log(`[@Attendance] Attendance added: MemberID = ${memberID}, EventID = ${eventID}, checkInDate = ${checkInDate}`);
    } catch (err) {
      console.error('[@Attendance] Error inserting attendance:', err);
    }
  }
}

module.exports = Attendance;