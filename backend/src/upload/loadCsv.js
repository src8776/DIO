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
  // console.log(`Raw date from CSV: "${dateString}"`);
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
  // console.log(`Formatted MySQL DateTime: "${formattedDate}"`);
  return formattedDate;
};

// Generate a SHA-256 hash of the file for duplicate checking
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

// Check if the file is a duplicate based on its hash
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
    return Promise.reject(error);
  }
};

// Process CSV with improved handling
const processCsv = async (filePath, eventType, organizationID, customEventTitle) => {
  const attendanceRecords = [];

  return new Promise(async (resolve, reject) => {
    // Check for duplicate file
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
          // Debug: Log raw headers to identify any issues
          // if (!attendanceRecords.length) {
          //   console.log('CSV Headers:', Object.keys(row));
          // }

          // Normalize column lookup with fallback options
          const getColumnValue = (possibleNames) => {
            // Log actual column names for debugging
            // if (!attendanceRecords.length) {
            //   console.log('Available columns:', Object.keys(row).map(key => `"${key}"`));
            // }

            // First try exact match
            for (const name of possibleNames) {
              if (row[name] !== undefined) return row[name];
            }

            // If no exact match, try normalized comparison (case-insensitive, trimmed)
            const normalizedKeys = Object.keys(row).map(key => ({
              original: key,
              normalized: key.toLowerCase().trim()
            }));

            for (const name of possibleNames) {
              const normalizedName = name.toLowerCase().trim();
              const match = normalizedKeys.find(k => k.normalized === normalizedName);
              if (match && row[match.original] !== undefined) {
                if (!attendanceRecords.length) {
                  console.log(`Found column "${name}" as "${match.original}"`);
                }
                return row[match.original];
              }
            }

            return null;
          };

          const email = getColumnValue(['Email', 'email']);
          const checkInDateStr = getColumnValue(['Checked-In Date', 'Checked-In Date ', 'CheckedInDate']);
          const firstName = getColumnValue(['First Name', 'FirstName', 'first name']);
          const lastName = getColumnValue(['Last Name', 'LastName', 'last name']);

          if (!email || !checkInDateStr) {
            console.warn('Skipping row due to missing Email or Checked-In Date:', row);
            stream.destroy(); // Stops further processing
            return reject(new Error('Missing Email or Checked-In Date rows in CSV file.'));
          }

          // Check for required fields after column normalization
          if (!firstName || !lastName) {
            console.warn('Skipping row due to missing First Name or Last Name:', row);
            return; // Skip this row but continue processing others
          }

          // console.log(`Raw CSV Date in Row: ${row[checkInDateStr]}`);
          const checkInDate = formatDateToMySQL(checkInDateStr);

          attendanceRecords.push({
            firstName,
            lastName,
            email,
            fullName: `${firstName} ${lastName}`,
            checkInDate,
            organizationID,
          });
        })
        .on('end', async () => {
          console.log('CSV records successfully processed');

          if (attendanceRecords.length === 0) {
            console.warn('No attendance records found, skipping.');
            await connection.rollback();
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error removing file:', err);
              else console.log('File removed successfully');
            });
            return resolve();
          }

          // Filter records with valid check-in dates
          const validRecords = attendanceRecords.filter(record => record.checkInDate);
          const invalidCount = attendanceRecords.length - validRecords.length;
          if (invalidCount > 0) {
            console.warn(`Skipped ${invalidCount} records due to invalid check-in dates.`);
          }

          if (validRecords.length === 0) {
            console.warn('No valid attendance records found, skipping.');
            await connection.rollback();
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error removing file:', err);
              else console.log('File removed successfully');
            });
            return resolve();
          }

          // Remove duplicates based on email and date (ignoring time)
          const seen = new Set();
          const uniqueValidRecords = validRecords.filter(record => {
            const date = record.checkInDate.split(' ')[0]; // e.g., "2024-09-07"
            const key = `${record.email}-${date}`;
            if (seen.has(key)) {
              return false; // Skip duplicate
            } else {
              seen.add(key);
              return true; // Keep first occurrence
            }
          });

          // Log duplicates removed
          const duplicateCount = validRecords.length - uniqueValidRecords.length;
          if (duplicateCount > 0) {
            console.log(`Removed ${duplicateCount} duplicate records based on email and date.`);
          }

          try {
            const startTime = Date.now();

            // Extract unique dates (date part only, ignoring time)
            const dates = validRecords.map(record => record.checkInDate.split(' ')[0]);
            const uniqueDates = [...new Set(dates)];

            // Reusable function to insert attendance records
            const insertAttendanceRecord = async (attendance, eventID, semester, organizationID) => {
              try {
                const memberID = await Member.insertMember({
                  username: attendance.email.split('@')[0],
                  email: attendance.email,
                  firstName: attendance.firstName,
                  lastName: attendance.lastName,
                  fullName: attendance.fullName
                });

                if (!memberID) {
                  throw new Error(`Missing MemberID for email "${attendance.email}"`);
                }

                await OrganizationMember.insertOrganizationMember(
                  organizationID,
                  memberID,
                  semester.SemesterID,
                  'Member'
                );

                console.log(`Before Insert attendance: Check-in Time for ${attendance.email}: ${attendance.checkInDate}`);
                await Attendance.insertAttendance(attendance, eventID, organizationID);
                await useAccountStatus.updateMemberStatus(memberID, organizationID, semester);
              } catch (err) {
                console.error(`Error processing row for email "${attendance.email}" on date "${attendance.checkInDate}": ${err.message}`);
                throw err;
              }
            };

            if (uniqueDates.length === 1) {
              // Case 1: Single-date case
              const checkInDate = uniqueDates[0];
              const termCode = await Semester.getOrCreateTermCode(checkInDate);
              const semester = await Semester.getSemesterByTermCode(termCode);
              const eventID = await EventInstance.getEventID(eventType, checkInDate, organizationID, customEventTitle);

              if (!eventID || !termCode) {
                console.warn(`No EventID found for ${eventType} and ${checkInDate}, skipping attendance insert.`);
                await connection.rollback();
                return reject(new Error(`No EventID found for ${eventType}, skipping attendance insert.`));
              }

              for (const attendance of validRecords) {
                await insertAttendanceRecord(attendance, eventID, semester, organizationID);
              }
            } else {
              // Case 2: Multiple-dates case with batch processing
              const dateToDataMap = new Map();
              const datePromises = uniqueDates.map(async (date) => {
                const termCode = await Semester.getOrCreateTermCode(date);
                const semester = await Semester.getSemesterByTermCode(termCode);
                const eventID = await EventInstance.getEventID(eventType, date, organizationID, customEventTitle);
                dateToDataMap.set(date, { termCode, semester, eventID });
              });

              await Promise.all(datePromises);

              // Check for missing eventIDs
              const missingEventDates = uniqueDates.filter(date => !dateToDataMap.get(date).eventID);
              if (missingEventDates.length > 0) {
                console.warn(`No EventID found for dates: ${missingEventDates.join(', ')}, skipping attendance insert.`);
                await connection.rollback();
                return reject(new Error(`No EventID found for some dates, skipping attendance insert.`));
              }

              for (const attendance of validRecords) {
                const checkInDate = attendance.checkInDate.split(' ')[0];
                const { semester, eventID } = dateToDataMap.get(checkInDate);
                await insertAttendanceRecord(attendance, eventID, semester, organizationID);
              }
            }

            // Log performance
            const duration = (Date.now() - startTime) / 1000;
            console.log(`Processed ${validRecords.length} records in ${duration} seconds`);

            // Insert file info into UploadedFilesHistory
            await insertFileInfo(filePath, connection);
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
