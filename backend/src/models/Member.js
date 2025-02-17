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
        `INSERT INTO Members (UserName, FirstName, LastName, Email, fullName, Major, GraduationYear, AcademicYear)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           UserName = VALUES(UserName),
           FirstName = VALUES(FirstName),
           LastName = VALUES(LastName),
           fullName = VALUES(fullName),
           Major = VALUES(Major),
           GraduationYear = VALUES(GraduationYear),
           AcademicYear = VALUES(AcademicYear)`,
        [
          username,
          firstName,
          lastName,
          member.email,
          fullName,
          member.major,
          member.graduationYear,
          member.academicYear,
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
}

module.exports = Member;