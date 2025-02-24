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
      throw err;
    }
  }

  static async insertVolunteerHours(memberID, eventID, organizationID, hours, eventDate) {
    if (!eventID) {
      console.error("Cannot insert attendance: EventID is null");
      return;
    }

    try {
      await db.query(
        `INSERT INTO Attendance (MemberID, EventID, CheckInTime, AttendanceStatus, AttendanceSource, OrganizationID, Hours)
           VALUES (?, ?, ?, 'Attended', 'Volunteer Form', ?, ?);`,
        [memberID, eventID, eventDate, organizationID, hours]
      );
      //for logs
      console.log(`[@Attendance] Volunteer hours added: MemberID = ${memberID}, EventID = ${eventID}, eventDate = ${eventDate}, hours = ${hours}`);
    } catch (err) {
      console.error('[@Attendance] Error inserting attendance:', err);
      throw err;
    }
  }

  static async getAttendanceByMemberAndOrg(memberID, organizationID) {
    try {
      const query = `
          SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'hours', t.Hours,
                      'eventDate', t.EventDate,
                      'eventType', t.EventType
                  )
              ) AS attendanceRecord
          FROM (
              SELECT et.EventType, DATE_FORMAT(ei.EventDate, '%Y-%m-%d') AS EventDate, a.Hours
              FROM Attendance AS a
              JOIN EventInstances AS ei ON a.EventID = ei.EventID
              JOIN EventTypes AS et ON ei.EventTypeID = et.EventTypeID
              WHERE a.OrganizationID = ? 
              AND a.MemberID = ?
              ORDER BY ei.EventDate
          ) AS t;
      `;
      const [rows] = await db.query(query, [organizationID, memberID]);
      return rows;
  } catch (error) {
      console.error('Error fetching Organization Info data:', error);
      throw error;
  }
  }
}

module.exports = Attendance;