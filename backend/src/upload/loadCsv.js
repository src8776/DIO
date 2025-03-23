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


/**
 * Formats a date string from CSV to MySQL DateTime format (YYYY-MM-DD HH:MM:SS).
 * @param {string} dateString - The raw date string from CSV (e.g., "09/07/2024 12:00 PM").
 * @returns {string|null} Formatted date string or null if invalid.
 */
const formatDateToMySQL = (dateString) => {
  if (!dateString) return null;
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
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};


/**
 * Generates a SHA-256 hash of a file for duplicate checking.
 * @param {string} filePath - Path to the file.
 * @returns {Promise<string>} Resolves with the file hash.
 */
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};


/**
 * Inserts file metadata into UploadedFilesHistory table.
 * @param {string} filePath - Path to the uploaded file.
 * @param {object} connection - Database connection object.
 * @returns {Promise<void>}
 */
const insertFileInfo = async (filePath, connection) => {
  const fileHash = await generateFileHash(filePath);
  await connection.query(
    `INSERT INTO UploadedFilesHistory (FileName, FileHash) VALUES (?, ?)`,
    [filePath, fileHash]
  );
  console.log(`File saved: ${filePath}`);
};


/**
 * Checks if a file is a duplicate based on its hash.
 * @param {string} filePath - Path to the file.
 * @returns {Promise<boolean>} True if the file is a duplicate.
 */
const isFileDuplicate = async (filePath) => {
  const fileHash = await generateFileHash(filePath);
  const [existingFile] = await db.query(
    `SELECT FileID FROM UploadedFilesHistory WHERE FileHash = ?`,
    [fileHash]
  );
  return existingFile.length > 0;
};


/**
 * Parses CSV file into an array of attendance records.
 * @param {string} filePath - Path to the CSV file.
 * @param {string} organizationID - Organization ID for the records.
 * @returns {Promise<object[]>} Array of parsed attendance records.
 */
const parseCsvFile = (filePath, organizationID) => {
  const attendanceRecords = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const getColumnValue = (possibleNames) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined) return row[name];
          }
          const normalizedKeys = Object.keys(row).map(key => ({
            original: key,
            normalized: key.toLowerCase().trim()
          }));
          for (const name of possibleNames) {
            const match = normalizedKeys.find(k => k.normalized === name.toLowerCase().trim());
            if (match) return row[match.original];
          }
          return null;
        };

        const email = getColumnValue(['Email', 'email']);
        const checkInDateStr = getColumnValue(['Checked-In Date', 'Checked-In Date ', 'CheckedInDate']);
        const firstName = getColumnValue(['First Name', 'FirstName', 'first name']);
        const lastName = getColumnValue(['Last Name', 'LastName', 'last name']);

        if (!email || !firstName || !lastName) {
          console.warn('Skipping row due to missing critical fields:', row);
          return;
        }

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
      .on('end', () => resolve(attendanceRecords))
      .on('error', reject);
  });
};


/**
 * Handles missing dates based on user choice.
 * @param {object[]} records - Array of attendance records.
 * @param {boolean} assignDate - Whether to assign a date to missing records.
 * @param {boolean} skipMissing - Whether to skip records with missing dates.
 * @returns {Promise<object[]>} Records to process.
 */
const handleMissingDates = async (records, assignDate, skipMissing) => {
  const validRecords = records.filter(record => record.checkInDate);
  const missingDateCount = records.length - validRecords.length;

  if (missingDateCount > 0) {
    console.warn(`Found ${missingDateCount} records with missing check-in dates.`);
    if (!assignDate && !skipMissing) {
      const dates = validRecords.map(record => record.checkInDate.split(' ')[0]);
      const uniqueDates = [...new Set(dates)];
      const error = new Error('Missing check-in dates for some records');
      error.missingCount = missingDateCount;
      if (uniqueDates.length === 1) {
        error.type = 'single_date_missing';
        error.eventDate = uniqueDates[0];
      } else {
        error.type = 'multiple_dates_missing';
      }
      throw error;
    }
  }

  if (assignDate && missingDateCount > 0) {
    const eventDate = validRecords[0].checkInDate.split(' ')[0];
    return records.map(record => ({
      ...record,
      checkInDate: record.checkInDate || `${eventDate} 12:00:00`
    }));
  }
  return validRecords;
};


/**
 * Inserts an attendance record into the database.
 * @param {object} attendance - Attendance record.
 * @param {number} eventID - Event instance ID.
 * @param {object} semester - Semester object.
 * @param {string} organizationID - Organization ID.
 * @returns {Promise<void>}
 */
const insertAttendanceRecord = async (attendance, eventID, semester, organizationID) => {
  const memberID = await Member.insertMember({
    username: attendance.email.split('@')[0],
    email: attendance.email,
    firstName: attendance.firstName,
    lastName: attendance.lastName,
    fullName: attendance.fullName
  });

  if (!memberID) throw new Error(`Missing MemberID for email "${attendance.email}"`);

  await OrganizationMember.insertOrganizationMember(
    organizationID,
    memberID,
    semester.SemesterID,
    'Member'
  );

  await Attendance.insertAttendance(attendance, eventID, organizationID);
  await useAccountStatus.updateMemberStatus(memberID, organizationID, semester);
};


/**
 * Processes a CSV file and inserts attendance records into the database.
 * @param {string} filePath - Path to the CSV file.
 * @param {string} eventType - Type of event.
 * @param {string} organizationID - Organization ID.
 * @param {string} customEventTitle - Custom event title (optional).
 * @param {boolean} [assignDate=false] - Assign date to missing records.
 * @param {boolean} [skipMissing=false] - Skip records with missing dates.
 * @param {string|null} [semesterStart=null] - Semester start date in YYYY-MM-DD format (optional).
 * @param {string|null} [semesterEnd=null] - Semester end date in YYYY-MM-DD format (optional).
 * @param {string} [semesterName=""] - Semester name (optional).
 * @returns {Promise<void>}
 */
const processCsv = async (
  filePath, eventType, organizationID,
  customEventTitle, assignDate = false,
  skipMissing = false, semesterStart = null,
  semesterEnd = null, semesterName = ""
) => {
  const startTime = Date.now();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check for duplicate file
    if (await isFileDuplicate(filePath)) {
      throw new Error('File already uploaded before!');
    }

    // Parse CSV file
    const records = await parseCsvFile(filePath, organizationID);
    if (records.length === 0) {
      console.warn('No attendance records found.');
      return;
    }

    // If semester boundaries provided, ensure all record dates fall within the semester.
    if (semesterStart && semesterEnd) {
      const recordsWithDates = records.filter(record => record.checkInDate);
      for (const record of recordsWithDates) {
        const recordDate = record.checkInDate.split(' ')[0];
        if (recordDate < semesterStart || recordDate > semesterEnd) {
          throw new Error(`File dates do not match the selected semester: ${semesterName}. Cancelling upload.`);
        }
      }
    }

    // Handle missing dates
    const recordsToProcess = await handleMissingDates(records, assignDate, skipMissing);

    // Remove duplicates based on email and date
    const seen = new Set();
    const uniqueRecords = recordsToProcess.filter(record => {
      const datePart = record.checkInDate.split(' ')[0].trim();
      const key = `${record.email}-${datePart}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const duplicatesRemoved = recordsToProcess.length - uniqueRecords.length;
    console.log(`Duplicates removed: ${duplicatesRemoved}`);

    // Process records by date
    const dates = [...new Set(uniqueRecords.map(record => record.checkInDate.split(' ')[0]))];
    if (dates.length === 1) {
      const termCode = await Semester.getOrCreateTermCode(dates[0]);
      const semester = await Semester.getSemesterByTermCode(termCode);
      const eventID = await EventInstance.getEventID(eventType, dates[0], organizationID, customEventTitle);
      if (!eventID) throw new Error(`No EventID found for ${eventType}`);

      for (const record of uniqueRecords) {
        await insertAttendanceRecord(record, eventID, semester, organizationID);
      }
    } else {
      const dateMap = new Map();
      await Promise.all(dates.map(async (date) => {
        const termCode = await Semester.getOrCreateTermCode(date);
        const semester = await Semester.getSemesterByTermCode(termCode);
        const eventID = await EventInstance.getEventID(eventType, date, organizationID, customEventTitle);
        dateMap.set(date, { semester, eventID });
      }));

      for (const record of uniqueRecords) {
        const { semester, eventID } = dateMap.get(record.checkInDate.split(' ')[0]);
        if (!eventID) throw new Error(`No EventID for date ${record.checkInDate}`);
        await insertAttendanceRecord(record, eventID, semester, organizationID);
      }
    }

    // Log performance
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Processed ${uniqueRecords.length} records in ${duration} seconds`);

    // Save file info and commit
    await insertFileInfo(filePath, connection);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if (error.message === 'File already uploaded before!') {
      fs.unlink(filePath, (err) => err && console.error('Error removing duplicate file:', err));
    }
    throw error;
  } finally {
    connection.release();
    fs.unlink(filePath, (err) => err && console.error('Error removing file:', err));
  }
};

module.exports = { processCsv };
