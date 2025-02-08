const db = require('../config/db');

class Member {
    static async getAllMembers() {
        const [rows] = await db.query('SELECT * FROM members');
        return rows;
    }
    static async getMemberById(id) {
        const [rows] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
        return rows[0];
    }

    static async createMember({ firstName, lastName, email, userName }) { 
        const [result] = await db.query(`INSERT INTO Members (UserName, FirstName, LastName, Email, DisplayName, Major, GraduationYear, AcademicYear)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE 
                FirstName = VALUES(FirstName),
                LastName = VALUES(LastName),
                DisplayName = VALUES(DisplayName),
                Major = VALUES(Major),
                GraduationYear = VALUES(GraduationYear),
                AcademicYear = VALUES(AcademicYear)`,
              [
                firstName,
                lastName,
                email,
                userName,
                displayName,
                major,
                graduationYear,
                academicYear,
              ]
            );
            const memberID = result.insertId || result.affectedRows;
            await db.query(
              `INSERT INTO OrganizationMembers (OrganizationID, MemberID, Role, RoleID)
              VALUES (?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE Role = VALUES(Role), RoleID = VALUES(RoleID)`,
              [organizationID, memberID, defaultRole, defaultRoleID]
            );
            return result.insertId;
    }

    static async updateMember(id, memberData) {
        const [result] = await db.query('UPDATE members SET ? WHERE id = ?', [memberData, id]);
        return result.affectedRows > 0;
    }
}

module.exports = Member;
