require('dotenv').config();

const fs = require('fs');
const csvParser = require('csv-parser');
const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: process.env.test.DB_HOST,
  user: process.env.test.DB_USER,
  password: process.env.test.DB_PASSWORD,
  database: process.env.test.DB_NAME,
});

// Connect to the database
db.connect(err => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database');
  });
  
  // Insert data into the Members table
  const insertMember = (member) => {
    const { firstName, lastName, email, organizationID } = member;
    const query = `
      INSERT INTO Members (FirstName, LastName, Email, OrganizationID)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE Email = VALUES(Email), OrganizationID = VALUES(OrganizationID)
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [firstName, lastName, email, organizationID], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId || result.affectedRows);
      });
    });
  };
  
  // Insert attendance data into the Attendance table
  const insertAttendance = (attendance) => {
    const { email, checkInDate, organizationID, eventID } = attendance;
  
    return new Promise((resolve, reject) => {
      // Retrieve MemberID using email
      const getMemberQuery = `SELECT MemberID FROM Members WHERE Email = ? AND OrganizationID = ?`;
      db.query(getMemberQuery, [email, organizationID], (err, rows) => {
        if (err) return reject(err);
  
        if (rows.length > 0) {
          const memberId = rows[0].MemberID;
          const query = `
            INSERT INTO Attendance (MemberID, EventID, CheckInTime, AttendanceSource, OrganizationID)
            VALUES (?, ?, ?, 'CSV Import', ?)
          `;
          db.query(query, [memberId, eventID, checkInDate, organizationID], (err) => {
            if (err) return reject(err);
            console.log(`Attendance inserted for MemberID ${memberId}`);
            resolve();
          });
        } else {
          console.warn(`No member found with email: ${email}`);
          resolve();
        }
      });
    });
  };
  
  // Process the CSV file
  const processCsv = (filePath) => {
    const members = [];
    const attendanceRecords = [];
    const organizationID = 1; // Set OrganizationID for WiC
  
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const member = {
          firstName: row['First Name'],
          lastName: row['Last Name'],
          email: row['Email'],
          organizationID
        };
        members.push(member);
  
        const attendance = {
          email: row['Email'],
          checkInDate: row['Checked-In Date'],
          eventID: 4, // Set eventtype as General Meeting
          organizationID
        };
        attendanceRecords.push(attendance);
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
  
        // Insert member data
        for (const member of members) {
          try {
            await insertMember(member);
          } catch (err) {
            console.error('Error inserting member:', err);
          }
        }
  
        // Insert attendance data
        for (const attendance of attendanceRecords) {
          try {
            await insertAttendance(attendance);
          } catch (err) {
            console.error('Error inserting attendance:', err);
          }
        }
  
        // Close the database connection
        db.end();
      });
  };
  
  // the CSV file path
  processCsv('');
