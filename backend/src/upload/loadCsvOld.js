const fs = require('fs');
const csvParser = require('csv-parser');
const db = require('../config/db');
require('dotenv').config({ path: '.env' });

const formatDateToMySQL = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date)) throw new Error(`Invalid date: ${dateString}`);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const processCsv = async (filePath, eventType, orgID) => {
  const members = [];
  const attendanceRecords = [];
  const organizationID = orgID;
  const eventID = 1; //TODO: EventID should be retrieved from eventType
  const defaultRole = 'Member';
  const defaultRoleID = 2;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (!row['Email'] || !row['Checked-In Date']) {
          console.warn('Skipping row due to missing Email or Checked-In Date:', row);
          return;
        }
        const email = row['Email'];
        const username = email.split('@')[0];

        members.push({
          username,
          firstName: row['First Name'],
          lastName: row['Last Name'],
          email,
          displayName: row['Display Name'] || `${row['First Name']} ${row['Last Name']}`,
          major: row['Major'] || null,
          graduationYear: row['Graduation Year'] || null,
          academicYear: row['Academic Year'] || null,
        });

        attendanceRecords.push({
          email,
          checkInDate: formatDateToMySQL(row['Checked-In Date']),
          eventID,
          organizationID,
        });
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
        const connection = await db.getConnection();
        try {
          await connection.beginTransaction();
          for (const member of members) {
            const [memberResult] = await connection.query(
              `INSERT INTO Members (UserName, FirstName, LastName, Email, DisplayName, Major, GraduationYear, AcademicYear)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE 
                FirstName = VALUES(FirstName),
                LastName = VALUES(LastName),
                DisplayName = VALUES(DisplayName),
                Major = VALUES(Major),
                GraduationYear = VALUES(GraduationYear),
                AcademicYear = VALUES(AcademicYear)`,
              [
                member.username,
                member.firstName,
                member.lastName,
                member.email,
                member.displayName,
                member.major,
                member.graduationYear,
                member.academicYear,
              ]
            );
            const memberID = memberResult.insertId || memberResult.affectedRows;
            await connection.query(
              `INSERT INTO OrganizationMembers (OrganizationID, MemberID, Role, RoleID)
              VALUES (?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE Role = VALUES(Role), RoleID = VALUES(RoleID)`,
              [organizationID, memberID, defaultRole, defaultRoleID]
            );
          }

          for (const attendance of attendanceRecords) {
            const [rows] = await connection.query(
              `SELECT m.MemberID FROM Members m JOIN OrganizationMembers om ON m.MemberID = om.MemberID WHERE m.Email = ? AND om.OrganizationID = ?`,
              [attendance.email, attendance.organizationID]
            );
            if (rows.length > 0) {
              const memberId = rows[0].MemberID;
              await connection.query(
                `INSERT INTO Attendance (MemberID, EventID, CheckInTime, AttendanceStatus, AttendanceSource, OrganizationID)
                VALUES (?, ?, ?, ?, 'CSV Import', ?)
                ON DUPLICATE KEY UPDATE AttendanceStatus = VALUES(AttendanceStatus)`,
                [memberId, attendance.eventID, attendance.checkInDate, 'Attended', attendance.organizationID]
              );
            } else {
              console.warn(`No member found with email: ${attendance.email}`);
            }
          }

          await connection.commit();
          console.log('Transaction committed successfully');
        } catch (error) {
          await connection.rollback();
          console.error('Transaction failed, rolled back:', error);
          reject(error);
        } finally {
          connection.release();
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error removing file:', err);
            else console.log('File removed successfully');
          });
        }
        resolve();
      });
  });
};

module.exports = { processCsv };