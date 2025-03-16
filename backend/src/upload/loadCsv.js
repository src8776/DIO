const fs = require('fs');
const csvParser = require('csv-parser');
const db = require('../config/db');
const crypto = require('crypto');
const Member = require('../models/Member');
const OrganizationMember = require('../models/OrganizationMember');
const Attendance = require('../models/Attendance');
const EventInstance = require('../models/EventInstance');
const Semester = require('../models/Semester');
const useAccountStatus = require('../services/useAccountStatus');
require('dotenv').config({ path: '.env' });

// Format both date and time for check-in for attendance record
const formatDateToMySQL = (dateString) => {
  if (!dateString) return null;
  console.log(`Raw date from CSV: "${dateString}"`);
  const parts = dateString.trim().split(/[/ :]/);
  if (parts.length < 5) {
    console.warn(`Invalid date format: "${dateString}"`);
    return null;
  }
  let [month, day, year, hours, minutes, period] = parts;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10) || 0;
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  console.log(`Formatted MySQL DateTime: "${formattedDate}"`);
  return formattedDate;
};

// Generate File Hash
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Insert File Info into UploadedFilesHistory
const insertFileInfo = async (filePath, connection) => {
  try {
    const fileHash = await generateFileHash(filePath);
    await connection.query(
      `INSERT INTO UploadedFilesHistory (FileName, FileHash) VALUES (?, ?)`,
      [filePath, fileHash]
    );
    console.log(`File saved: ${filePath}`);
  } catch (error) {
    console.error('Error saving file record:', error);
    throw error;
  }
};

// Check if file has already been uploaded
const isFileDuplicate = async (filePath) => {
  try {
    const fileHash = await generateFileHash(filePath);
    const [existingFile] = await db.query(
      `SELECT FileID FROM UploadedFilesHistory WHERE FileHash = ?`,
      [fileHash]
    );
    return existingFile.length > 0;
  } catch (error) {
    console.error('Error checking file duplicate:', error);
    return Promise.reject(error); // Use reject instead of throw
  }
};

// Process CSV with File Check
const processCsv = async (filePath, eventType, organizationID) => {
  const attendanceRecords = [];

  return new Promise(async (resolve, reject) => {
    try {
      const isDuplicate = await isFileDuplicate(filePath);
      if (isDuplicate) {
        console.warn(`File already uploaded: ${filePath}`);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error removing duplicate file:', err);
          else console.log('Duplicate file removed successfully.');
        });
        return reject(new Error("File already uploaded before!")); 
      }
    } catch (error) {
      console.error('Error processing CSV file:', error);
      return reject(error);
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const stream = fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (!row['Email'] || !row['Checked-In Date']) {
          console.warn('Skipping row due to missing Email or Checked-In Date:', row);
          stream.destroy(); // Stops further processing
          return reject(new Error('Missing Email or Checked-In Date rows in CSV file.'));
        }

        console.log(`Raw CSV Date in Row: ${row['Checked-In Date']}`);
        const checkInDate = formatDateToMySQL(row['Checked-In Date']);

        attendanceRecords.push({
          firstName: row['First Name'],
          lastName: row['Last Name'],
          email: row['Email'],
          fullName: `${row['First Name']} ${row['Last Name']}`,
          checkInDate,
          organizationID,
        });
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');

        if (attendanceRecords.length === 0) {
          console.warn('No attendance records found, skipping.');
          await connection.rollback();
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error removing file:', err);
            else console.log('File removed successfully');
          });
          return resolve(); 
        }

        try {
          const checkInDate = attendanceRecords[0].checkInDate.split(' ')[0];
          // Fetch TermCode
          const termCode = await Semester.getOrCreateTermCode(checkInDate);
          // Fetch Semester object
          const semester = await Semester.getSemesterByTermCode(termCode);
          // Fetch EventID once
          const eventID = await EventInstance.getEventID(eventType, checkInDate, organizationID);

          if (!eventID || !termCode) {
            console.warn(`No EventID found for ${eventType} and ${termCode}, skipping attendance insert.`);
            await connection.rollback();
            return reject(new Error(`No EventID found for ${eventType}, skipping attendance insert.`));
          }

          for (const attendance of attendanceRecords) {
            try {
              const memberID = await Member.insertMember({
                username: attendance.email.split('@')[0],
                email: attendance.email,
                firstName: attendance.firstName,
                lastName: attendance.lastName,
                fullName: attendance.fullName
              });

              if (!memberID) {
                console.warn(`Skipping ${attendance.email} due to missing MemberID`);
                await connection.rollback();
                return reject(new Error(`Skipping ${attendance.email} due to missing MemberID`));
              }

              // insert in OrganizationMembers if new member or new semester
              await OrganizationMember.insertOrganizationMember(
                attendance.organizationID,
                memberID,
                semester.SemesterID,
                'Member'
              );

              // Insert attendance
              console.log(`Before Insert attendance: Check-in Time for ${attendance.email}: ${attendance.checkInDate}`);
              await Attendance.insertAttendance(attendance, eventID, organizationID);
              await useAccountStatus.updateMemberStatus(memberID, organizationID, semester);
            } catch (err) {
              console.error(`Error processing row for ${attendance.email}, rolling back...`, err);
              await connection.rollback();
              return reject(new Error(`Error processing row for ${attendance.email}, rolling back...`));
            }
          }

          await connection.commit();
          console.log('Transaction committed successfully');
          resolve();
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
      })
      .on('error', async (error) => {
        console.error('Error reading CSV:', error);
        await connection.rollback();
        reject(error);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error removing file:', err);
            else console.log('File removed successfully');
        });
    });

} catch (error) {
await connection.rollback();
console.error('Transaction failed, rolled back:', error);
reject(error);
} finally {
connection.release();
}
  });
};

module.exports = { processCsv };
