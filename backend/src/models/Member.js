const db = require('../config/db');

class Member {
  static async insertMember(member) {
    try {
      const username = member.email ? member.email.split('@')[0] : null;
      if (!username) {
        throw new Error(`Invalid email format for ${member.email}`);
      }

      // Remove any punctuation marks, comma, quotes from names
      const firstName = member.firstName ? member.firstName.replace(/'/g, "''") : null;
      const lastName = member.lastName ? member.lastName.replace(/'/g, "''") : null;
      const fullName = member.fullName ? member.fullName.replace(/'/g, "''") : null;

      // Insert the member
      const [result] = await db.query(
        `INSERT INTO Members (UserName, FirstName, LastName, Email, FullName, MajorID, GraduationYear, AcademicYear, ShirtSize, PantSize, Race, Gender)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           UserName = VALUES(UserName),
           FirstName = VALUES(FirstName),
           LastName = VALUES(LastName),
           FullName = VALUES(FullName),
           MajorID = VALUES(MajorID),
           GraduationYear = VALUES(GraduationYear),
           AcademicYear = VALUES(AcademicYear),
           ShirtSize = VALUES(ShirtSize),
           PantSize = VALUES(PantSize),
           Race = VALUES(Race),
           Gender = VALUES(Gender)`,
        [
          username,
          firstName,
          lastName,
          member.email,
          fullName,
          member.majorID || null,
          member.graduationYear || null,
          member.academicYear || null,
          member.shirtSize || null,
          member.pantSize || null,
          member.race || null,
          member.gender || null
        ]
      );

      // If inserted, return new MemberID
      if (result.insertId) return result.insertId;

      // If already exists, fetch MemberID
      const [[existingMember]] = await db.query(
        'SELECT MemberID FROM Members WHERE Email = ?',
        [member.email]
      );
      return existingMember?.MemberID;
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
      return member?.Email || null;
    } catch (err) {
      console.error('Error fetching member email:', err);
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