const fs = require('fs');
const csvParser = require('csv-parser');
const db = require('../config/db');
  
  // Format date to MYSQL date format
  const formatDateToMySQL = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date)) throw new Error(`Invalid date: ${dateString}`);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Insert data into the Members table
  const insertMember = (member) => {
    const { username, firstName, lastName, email, displayName, major, graduationYear, academicYear } = member;
    const query = `
       INSERT INTO Members (UserName, FirstName, LastName, Email, DisplayName, Major, GraduationYear, AcademicYear)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      FirstName = VALUES(FirstName),
      LastName = VALUES(LastName),
      DisplayName = VALUES(DisplayName),
      Major = VALUES(Major),
      GraduationYear = VALUES(GraduationYear),
      AcademicYear = VALUES(AcademicYear)
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [username, firstName, lastName, email, displayName, major, graduationYear, academicYear], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId || result.affectedRows);
      });
    });
  };
  
  // Insert member into the OrganizationMembers table
const insertOrganizationMember = (orgMember) => {
  const { organizationID, memberID, role, roleID } = orgMember;
  const query = `
    INSERT INTO OrganizationMembers (OrganizationID, MemberID, Role, RoleID)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE Role = VALUES(Role), RoleID = VALUES(RoleID)
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [organizationID, memberID, role, roleID], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId || result.affectedRows);
    });
  });
};

  // Insert attendance data into the Attendance table
  const insertAttendance = (attendance) => {
    const { email, checkInDate, organizationID, eventID } = attendance;
  
      // Set value for AttendanceStatusID as attended
    //const attendanceStatusID = 1;
    const attendanceStatus = 'Attended';

    return new Promise((resolve, reject) => {
      // Retrieve MemberID using email
      const getMemberQuery = `SELECT m.MemberID FROM Members m JOIN OrganizationMembers om ON m.MemberID = om.MemberID WHERE m.Email = ? AND om.OrganizationID = ?`;
      db.query(getMemberQuery, [email, organizationID], (err, rows) => {
        if (err) return reject(err);
  
        if (rows.length > 0) {
          const memberId = rows[0].MemberID;
          const query = `
            INSERT INTO Attendance (MemberID, EventID, CheckInTime, AttendanceStatus, AttendanceSource, OrganizationID)
            VALUES (?, ?, ?, ?, 'CSV Import', ?)
            ON DUPLICATE KEY UPDATE AttendanceStatus = VALUES(AttendanceStatus);
          `;
          db.query(query, [memberId, eventID, checkInDate, attendanceStatus, organizationID], (err) => {
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
    const eventID = 1; // set EventID for General Meeting
    const defaultRole = 'Member';
    const defaultRoleID = 2;
  
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (!row['Email'] || !row['Checked-In Date']) {
          console.warn('Skipping row due to missing Email or Checked-In Date:', row);
          return;
        }      
      
      const email = row['Email'];
      const username = email.split('@')[0]; // Extract username from email

      const member = {
        username,
        firstName: row['First Name'],
        lastName: row['Last Name'],
        email,
        displayName: row['Display Name'] || `${row['First Name']} ${row['Last Name']}`,
        major: row['Major'] || null,
        graduationYear: row['Graduation Year'] || null,
        academicYear: row['Academic Year'] || null,
      };
        members.push(member);
  
        const attendance = {
          email: row['Email'],
          checkInDate: formatDateToMySQL(row['Checked-In Date']),
          eventID: 1, // Set eventtype as General Meeting
          organizationID
        };
        attendanceRecords.push(attendance);
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
  
        // Insert member data
        for (const member of members) {
          try {
            const memberID = await insertMember(member);
            await insertOrganizationMember({
              organizationID,
              memberID,
              role: defaultRole,
              roleID: defaultRoleID,
            });
          } catch (err) {
            console.error('Error inserting member or organization members:', err);
            throw err;
          }
        }
  
        // Insert attendance data
        for (const attendance of attendanceRecords) {
          try {
            await insertAttendance(attendance);
          } catch (err) {
            console.error('Error inserting attendance:', err);
            throw err;
          }
        }

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error removing file:', err);
          } else {
            console.log('File removed successfully');
          }
        });
  
        // Close the database connection
        // CONNECTION WILL BE FOREVER OPEN!!!
        // db.end();
      });
  };
  
  // the CSV file path
  module.exports = { processCsv };
