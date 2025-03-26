const db = require('../config/db');

class Member {
  static async insertMember(member) {
    try {
      const email = member.email;
      if (!email) {
        throw new Error('Email is required');
      }

      // Check if member exists
      const [[existingMember]] = await db.query(
        'SELECT MemberID FROM Members WHERE Email = ?',
        [email]
      );

      if (existingMember) {
        return existingMember.MemberID; // Return ID without updating
      }

      // Insert new member with available data
      const username = email.split('@')[0];
      const firstName = member.firstName ? member.firstName.replace(/'/g, "''") : null;
      const lastName = member.lastName ? member.lastName.replace(/'/g, "''") : null;
      const fullName = member.fullName ? member.fullName.replace(/'/g, "''") : null;

      const [result] = await db.query(
        `INSERT INTO Members (UserName, FirstName, LastName, Email, FullName)
         VALUES (?, ?, ?, ?, ?)`,
        [username, firstName, lastName, email, fullName]
      );

      return result.insertId;
    } catch (err) {
      console.error('Error inserting member:', err);
      throw err;
    }
  }

  // This doesn't appear to be used anywhere? Should we remove it?
  static async lastUpdatedMemberAttendance() {
    const query = `
            SELECT
                Members.MemberID,
                OrganizationMembers.Status,
                Members.FullName,
                COUNT(Attendance.MemberID) AS AttendanceRecord
            FROM
                Members
            JOIN
                OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
            JOIN
                Organizations ON OrganizationMembers.OrganizationID = Organizations.OrganizationID
            LEFT JOIN
                Attendance ON Members.MemberID = Attendance.MemberID
            LEFT JOIN
                Roles ON OrganizationMembers.RoleID = Roles.RoleID
            GROUP BY
                Members.MemberID,
                Members.FullName,
                OrganizationMembers.Status;
        `;
  }

  static async getMemberEmailById(memberId) {
    try {
      const [[member]] = await db.query(
        'SELECT Email FROM Members WHERE MemberID = ?',
        [memberId]
      );
      return member?.Email || null;
    } catch (err) {
      console.error('Error fetching member email:', err);
      throw err;
    }
  }

  static async getMemberNameById(memberId) {
    try {
      const [[member]] = await db.query(
        'SELECT FirstName FROM Members WHERE MemberID = ?',
        [memberId]
      );
      return member?.FirstName || null;
    } catch (err) {
      console.error('Error fetching member name:', err);
      throw err;
    }
  }

  static async getMemberByEmail(email) {
    try {
      const [[member]] = await db.query(
        'SELECT * FROM Members WHERE Email = ?',
        [email]
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member email:', err);
      throw err;
    }
  }

  static async getMajorById(majorID) {
    try {
      const [[major]] = await db.query(
        'SELECT Title FROM Majors WHERE MajorID = ?',
        [majorID],
      );
      return major ? major.Title : null;
    } catch (err) {
      console.error('Error fetching major:', err);
      throw err;
    }
  }

  static async getMajorIdByTitle(majorTitle) {
    try {
      const [[major]] = await db.query(
        'SELECT MajorID FROM Majors WHERE Title = ?',
        [majorTitle],
      );
      return major ? major.MajorID : null;
    } catch (err) {
      console.error('Error fetching major:', err);
      throw err;
    }
  }

  static async getMajors() {
    try {
      const [majors] = await db.query(
        'SELECT Title FROM Majors');
      return majors || null;
    } catch (err) {
      console.error('Error fetching major:', err);
      throw err;
    }
  }

  static async getShirtSizeCount(orgID, selectedSemester) {
    try {
      const [sizes] = await db.query(
        `SELECT ShirtSize, COUNT(*) as count 
         FROM Members 
         JOIN OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
         WHERE OrganizationMembers.OrganizationID = ? AND OrganizationMembers.SemesterID = ?
         GROUP BY ShirtSize`,
        [orgID, selectedSemester]
      );
      const defaultSizes = { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, null: 0 };
      return sizes.reduce((acc, size) => {
        acc[size.ShirtSize] = size.count;
        return acc;
      }, defaultSizes);
    } catch (err) {
      console.error('Error fetching shirt sizes:', err);
      throw err;
    }
  }

  static async getPantSizeCount(orgID, selectedSemester) {
    try {
      const [sizes] = await db.query(
        `SELECT PantSize, COUNT(*) as count 
         FROM Members 
         JOIN OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
         WHERE OrganizationMembers.OrganizationID = ? AND OrganizationMembers.SemesterID = ?
         GROUP BY PantSize`,
        [orgID, selectedSemester]
      );
      return sizes.reduce((acc, size) => {
        acc[size.PantSize] = size.count;
        return acc;
      }, {});
    } catch (err) {
      console.error('Error fetching pant sizes:', err);
      throw err;
    }
  }

  static async getMemberReportData(orgID, selectedSemester, memberStatus) {
    try {
      let statuses;
      switch (memberStatus) {
        case "both":
          statuses = ["Active", "Inactive", "Exempt"];
          break;
        case "general":
          statuses = ["Inactive"];
          break;
        case "active":
          statuses = ["Active", "Exempt"];
          break;
        default:
          statuses = ["Active", "Inactive", "Exempt"];
      }
      const [members] = await db.query(
        `SELECT Members.FullName, OrganizationMembers.Status, Members.Email, Members.GraduationYear, Members.AcademicYear, Members.ShirtSize, Members.PantSize, Members.Gender, Members.Race, Majors.Title as Major
        FROM Members
        LEFT JOIN Majors ON Members.MajorID = Majors.MajorID
		    LEFT JOIN OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
        WHERE OrganizationMembers.OrganizationID = ? AND OrganizationMembers.SemesterID = ? AND OrganizationMembers.Status in (?)
        ORDER BY Members.LastName, Members.FirstName`,
        [orgID, selectedSemester, statuses]
      );
      return members || null;
    } catch (err) {
      console.error('Error fetching member report data:', err);
      throw err;
    }
  }

  /*
  static async getEnumValues(columnName) {
    try {
      const [result] = await db.query(`SHOW COLUMNS FROM Members LIKE ?`, [columnName]);
      if (!result.length) {
        throw new Error(`Column ${columnName} not found in Members table`);
      }
  
      // Extract ENUM values from the result
      const enumValues = result[0].Type.match(/enum\((.*)\)/)[1]
        .split(',')
        .map(value => value.replace(/'/g, '')); // Remove quotes
  
      return enumValues;
    } catch (err) {
      console.error(`Error fetching ENUM values for ${columnName}:`, err);
      throw err;
    }
  }
  */

}

module.exports = Member;