const DBHelper = require('../utils/DBHelper');

class Member {
  static async insertMember(member, connection = null) {
    try {
      const email = member.email;
      if (!email) {
        throw new Error('Email is required');
      }

      // Check if member exists
      const [[existingMember]] = await DBHelper.runQuery(
        'SELECT MemberID FROM Members WHERE Email = ?',
        [email], connection
      );

      if (existingMember) {
        return existingMember.MemberID; // Return ID without updating
      }

      // Insert new member with available data
      const username = email.split('@')[0];
      const firstName = member.firstName ? member.firstName.replace(/'/g, "''") : null;
      const lastName = member.lastName ? member.lastName.replace(/'/g, "''") : null;
      const fullName = member.fullName ? member.fullName.replace(/'/g, "''") : null;

      const [result] = await DBHelper.runQuery(
        `INSERT INTO Members (UserName, FirstName, LastName, Email, FullName)
         VALUES (?, ?, ?, ?, ?)`,
        [username, firstName, lastName, email, fullName], connection
      );

      return result.insertId;
    } catch (err) {
      console.error('Error inserting member:', err);
      throw err;
    }
  }

  static async updateMemberProfile(member, connection = null) {
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
      const [result] = await DBHelper.runQuery(
        `INSERT INTO Members (UserName, FirstName, LastName, Email, FullName, MajorID, GraduationSemester, AcademicYear, ShirtSize, PantSize, Race, Gender)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           UserName = VALUES(UserName),
           FirstName = VALUES(FirstName),
           LastName = VALUES(LastName),
           FullName = VALUES(FullName),
           MajorID = VALUES(MajorID),
           GraduationSemester = VALUES(GraduationSemester),
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
          member.graduationSemester || null,
          member.academicYear || null,
          member.shirtSize || null,
          member.pantSize || null,
          member.race || null,
          member.gender || null
        ], connection
      );

      // If inserted, return new MemberID
      if (result.insertId) return result.insertId;

      // If already exists, fetch MemberID
      const [[existingMember]] = await DBHelper.runQuery(
        'SELECT MemberID FROM Members WHERE Email = ?',
        [member.email], connection
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

  static async getMemberEmailById(memberId, connection = null) {
    try {
      const [[member]] = await DBHelper.runQuery(
        'SELECT Email FROM Members WHERE MemberID = ?',
        [memberId], connection
      );
      return member?.Email || null;
    } catch (err) {
      console.error('Error fetching member email:', err);
      throw err;
    }
  }

  static async getMemberNameById(memberId, connection = null) {
    try {
      const [[member]] = await DBHelper.runQuery(
        'SELECT FirstName FROM Members WHERE MemberID = ?',
        [memberId], connection
      );
      return member?.FirstName || null;
    } catch (err) {
      console.error('Error fetching member name:', err);
      throw err;
    }
  }

  static async getMemberByEmail(email, connection = null) {
    try {
      const [[member]] = await DBHelper.runQuery(
        'SELECT * FROM Members WHERE Email = ?',
        [email], connection
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member email:', err);
      throw err;
    }
  }

  static async getMajorById(majorID, connection = null) {
    try {
      const [[major]] = await DBHelper.runQuery(
        'SELECT Title FROM Majors WHERE MajorID = ?',
        [majorID], connection
      );
      return major ? major.Title : null;
    } catch (err) {
      console.error('Error fetching major:', err);
      throw err;
    }
  }

  static async getMajorIdByTitle(majorTitle, connection = null) {
    try {
      const [[major]] = await DBHelper.runQuery(
        'SELECT MajorID FROM Majors WHERE Title = ?',
        [majorTitle], connection
      );
      return major ? major.MajorID : null;
    } catch (err) {
      console.error('Error fetching major:', err);
      throw err;
    }
  }

  static async getMajors(connection = null) {
    try {
      const [majors] = await DBHelper.runQuery(
        'SELECT Title FROM Majors', [], connection
      );
      return majors || null;
    } catch (err) {
      console.error('Error fetching major:', err);
      throw err;
    }
  }

  static async getShirtSizeCount(orgID, selectedSemester, connection = null) {
    try {
      const [sizes] = await DBHelper.runQuery(
        `SELECT ShirtSize, COUNT(*) as count 
         FROM Members 
         JOIN OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
         WHERE OrganizationMembers.OrganizationID = ? AND OrganizationMembers.SemesterID = ?
         GROUP BY ShirtSize`,
        [orgID, selectedSemester], connection
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

  static async getPantSizeCount(orgID, selectedSemester, connection = null) {
    try {
      const [sizes] = await DBHelper.runQuery(
        `SELECT PantSize, COUNT(*) as count 
         FROM Members 
         JOIN OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
         WHERE OrganizationMembers.OrganizationID = ? AND OrganizationMembers.SemesterID = ?
         GROUP BY PantSize`,
        [orgID, selectedSemester], connection
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

  static async getMemberReportData(orgID, selectedSemester, memberStatus, connection = null) {
    try {
      let statuses;
      switch (memberStatus) {
        case "both":
          statuses = ["Active", "General", "Exempt"];
          break;
        case "general":
          statuses = ["General"];
          break;
        case "active":
          statuses = ["Active", "Exempt"];
          break;
        default:
          statuses = ["Active", "General", "Exempt"];
      }
      const [members] = await DBHelper.runQuery(
        `SELECT Members.FullName, OrganizationMembers.Status, Members.Email, Members.GraduationYear, Members.AcademicYear, Members.ShirtSize, Members.PantSize, Members.Gender, Members.Race, Majors.Title as Major
        FROM Members
        LEFT JOIN Majors ON Members.MajorID = Majors.MajorID
        LEFT JOIN OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
        WHERE OrganizationMembers.OrganizationID = ? AND OrganizationMembers.SemesterID = ? AND OrganizationMembers.Status in (?)
        ORDER BY Members.LastName, Members.FirstName`,
        [orgID, selectedSemester, statuses], connection
      );
      return members || null;
    } catch (err) {
      console.error('Error fetching member report data:', err);
      throw err;
    }
  }
}

module.exports = Member;