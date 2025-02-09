const fs = require('fs');
const crypto = require('crypto'); // For generating unique file hashes
const csvParser = require('csv-parser');
const db = require('../config/db');
require('dotenv').config({ path: '.env' });

// Calculate the hash of a file and check if it already exists in db
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

const formatDateToMySQL = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date)) throw new Error(`Invalid date: ${dateString}`);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const getOrCreateEvent = async (eventType, eventDate) => {
  const formattedDate = formatDateToMySQL(eventDate);
  const organizationID = 1;
  
  // check ifg event already exists in db
  const [existingEvent = []] = await db.query(
    'SELECT EventID FROM Events WHERE OrganizationID = ? AND EventType = ? AND EventDate = ?',
    [organizationID, eventType, formattedDate]
  ); 

  if (existingEvent.length > 0) {
    console.log('Event already exists in the database');
    return existingEvent[0].EventID; // Return existing event ID
  }

  // if not found, insert new event into db
  const [eventResult] = await db.query(
    'INSERT INTO Events (OrganizationID, EventType, EventDate) VALUES (?, ?, ?)',
    [organizationID, eventType, formattedDate]
  );

  return eventResult.insertId; // Return new event ID
};

const processCsv = async (filePath, eventType) => {
  const members = [];
  const attendanceRecords = [];
  const organizationID = 1; // hardcored for now
  const defaultRole = 'Member';
  const defaultRoleID = 2;

  try {
    const fileHash = await generateFileHash(filePath);
    const [existingFile = []] = await db.query('SELECT * FROM UploadedFiles WHERE FileHash = ?', [fileHash]);

    if (existingFile.length > 0) {
      console.log('File already processed:', filePath); // for troubleshooting
      console.warn('File already processed: $(filePath)');
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error removing duplicate file:', err);
        else console.log('File removed successfully');
      });
      return
    }

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', async (row) => {
        if (!row['Email'] || !row['Checked-In Date']) {
          console.warn('Skipping row due to missing Email or Checked-In Date:', row);
          return;
        }

        const email = row['Email'];
        const username = email.split('@')[0];
        const checkInDate = formatDateToMySQL(row['Checked-In Date']);

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
          checkInDate,
          organizationID,
        });
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
        
        if (attendanceRecords.length === 0) {
          console.warn('No attendance records found, skipping processing.');
          return resolve();
        }

        const connection = await db.getConnection();
        try {
          await connection.beginTransaction();

          // Insert the selected eventType only once
          const eventDate = attendanceRecords[0].checkInDate;
          const eventID = await getOrCreateEvent(eventType, eventDate);

          // Save the file upload to prevent duplicates
          await connection.query('INSERT INTO UploadedFiles (FileName, FileHash) VALUES (?, ?)', [filePath, fileHash]);

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

            const memberID = memberResult.insertId || ( await connection.query('SELECT MemberID FROM Members WHERE Email = ?', [member.email]) )[0][0]?.MemberID;
            
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
                [memberId, eventID, attendance.checkInDate, 'Attended', attendance.organizationID]
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
  } catch (error) {
    console.error('Error processing CSV file:', error);
    throw error;
  }
};

module.exports = { processCsv };