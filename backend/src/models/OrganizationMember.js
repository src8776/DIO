const db = require('../config/db');
const DBHelper = require('../utils/DBHelper');

class OrganizationMember {
  static async insertOrganizationMember(organizationID, memberID, semesterID, role = 'Member', connection = null) {
    try {
      const [[roleResult]] = await DBHelper.runQuery(
        'SELECT RoleID FROM Roles WHERE RoleName = ?',
        [role], connection
      );

      if (!roleResult) {
        console.error(`Role '${role}' does not exist.`);
        return;
      }

      const roleID = roleResult.RoleID;

      const [[exists]] = await DBHelper.runQuery(
        'SELECT 1 FROM OrganizationMembers WHERE OrganizationID = ? AND MemberID = ? AND SemesterID = ?',
        [organizationID, memberID, semesterID], connection
      );

      if (!exists) {
        await DBHelper.runQuery(
          `INSERT INTO OrganizationMembers (OrganizationID, MemberID, SemesterID, Status, RoleID)
           VALUES (?, ?, ?, ?, ?)`,
          [organizationID, memberID, semesterID, 'General', roleID], connection
        );
        console.log(`Added to OrganizationMembers: MemberID ${memberID}, Status: General, RoleID ${roleID}, SemesterID ${semesterID}`);
      }
    } catch (err) {
      console.error('Error inserting into OrganizationMembers:', err);
      throw err;
    }
  }

  static async insertOrganizationMemberWithRoleStatus(organizationID, memberID, semesterID, roleID, status, connection = null) {
    try {
      const [[exists]] = await DBHelper.runQuery(
        'SELECT 1 FROM OrganizationMembers WHERE OrganizationID = ? AND MemberID = ? AND SemesterID = ?',
        [organizationID, memberID, semesterID], connection
      );

      if (exists) {
        await DBHelper.runQuery(
          `UPDATE OrganizationMembers 
           SET Status = ?, RoleID = ? 
           WHERE OrganizationID = ? AND MemberID = ? AND SemesterID = ?`,
          [status, roleID, organizationID, memberID, semesterID], connection
        );
        console.log(`Updated OrganizationMembers: MemberID ${memberID}, Status: ${status}, RoleID ${roleID}, SemesterID ${semesterID}`);
      } else {
        await DBHelper.runQuery(
          `INSERT INTO OrganizationMembers (OrganizationID, MemberID, SemesterID, Status, RoleID)
           VALUES (?, ?, ?, ?, ?)`,
          [organizationID, memberID, semesterID, status, roleID], connection
        );
        console.log(`Added to OrganizationMembers: MemberID ${memberID}, Status: ${status}, RoleID ${roleID}, SemesterID ${semesterID}`);
      }
    } catch (err) {
      console.error('Error inserting/updating OrganizationMembers:', err);
      throw err;
    }
  }

  static async removeRecordsAfterSemester(organizationID, memberID, semesterID, connection = null) {
    try {
      const [result] = await DBHelper.runQuery(
        `DELETE FROM OrganizationMembers
         WHERE OrganizationID = ? AND MemberID = ? AND SemesterID > ?`,
        [organizationID, memberID, semesterID], connection
      );
      console.log(`Removed ${result.affectedRows} records for MemberID ${memberID} in OrganizationID ${organizationID} after SemesterID ${semesterID}`);
      return result.affectedRows;
    } catch (err) {
      console.error(`Error removing records for MemberID ${memberID} in OrganizationID ${organizationID} after SemesterID ${semesterID}:`, err);
      throw err;
    }
  }

  static async updateMemberStatus(memberID, organizationID, status, semesterID, connection = null) {
    try {
      const [[existing]] = await DBHelper.runQuery(
        `SELECT 1 FROM OrganizationMembers WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?`,
        [memberID, organizationID, semesterID], connection
      );

      if (existing) {
        await DBHelper.runQuery(
          `UPDATE OrganizationMembers SET Status = ? WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?`,
          [status, memberID, organizationID, semesterID], connection
        );
      } else {
        await DBHelper.runQuery(
          `INSERT INTO OrganizationMembers (MemberID, OrganizationID, Status, SemesterID) VALUES (?, ?, ?, ?)`,
          [memberID, organizationID, status, semesterID], connection
        );
      }
    } catch (err) {
      console.error('Error updating member status:', err);
      throw err;
    }
  }

  static async getMemberStatus(memberID, organizationID, semesterID, connection = null) {
    try {
      const [[result]] = await DBHelper.runQuery(
        `SELECT Status
         FROM OrganizationMembers
         WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?`,
        [memberID, organizationID, semesterID], connection
      );
      return result?.Status;
    } catch (error) {
      console.error('Error getting member status:', error);
      throw error;
    }
  }

  static async getMemberRole(memberID, organizationID, connection = null) {
    try {
      const query = `
            SELECT Roles.RoleName
            FROM OrganizationMembers
            JOIN Roles ON OrganizationMembers.RoleID = Roles.RoleID
            WHERE OrganizationMembers.MemberID = ? AND OrganizationMembers.OrganizationID = ?
        `;
      const [[result]] = await DBHelper.runQuery(query, [memberID, organizationID], connection);
      return result?.RoleName;
    } catch (error) {
      console.error('Error fetching member role:', error);
      throw error;
    }
  }

  static async getMemberStatsByOrgAndSemester(organizationID, semesterID, connection = null) {
    try {
      const query = `
            SELECT 
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activeMembers,
                SUM(CASE WHEN Status = 'General' THEN 1 ELSE 0 END) AS generalMembers
            FROM OrganizationMembers
            WHERE OrganizationID = ? AND SemesterID = ?
        `;
      const [[result]] = await DBHelper.runQuery(query, [organizationID, semesterID], connection);
      return {
        activeMembers: parseInt(result.activeMembers),
        generalMembers: parseInt(result.generalMembers)
      };
    } catch (error) {
      console.error('Error fetching member stats:', error);
      throw error;
    }
  }

  static async getMemberByID(memberID, connection = null) {
    try {
      const [[member]] = await DBHelper.runQuery(
        'SELECT * FROM OrganizationMembers WHERE MemberID = ?',
        [memberID], connection
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member:', err);
      throw err;
    }
  }

  static async getComsMemberByID(memberID, orgID, connection = null) {
    try {
      const [[member]] = await DBHelper.runQuery(
        `SELECT * FROM OrganizationMembers 
         WHERE MemberID = ? AND OrganizationID = ? 
         ORDER BY SemesterID DESC LIMIT 1`,
        [memberID, orgID], connection
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member:', err);
      throw err;
    }
  }

  static async getWicMemberByID(memberID, orgID, connection = null) {
    try {
      const [[member]] = await DBHelper.runQuery(
        `SELECT * FROM OrganizationMembers 
         WHERE MemberID = ? AND OrganizationID = ? 
         ORDER BY SemesterID DESC LIMIT 1`,
        [memberID, orgID], connection
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member:', err);
      throw err;
    }
  }

  static async getAllMembersByOrgAndSemester(organizationID, semesterID, connection = null) {
    try {
      const [members] = await DBHelper.runQuery(
        `SELECT DISTINCT Members.MemberID, Members.GraduationSemester, OrganizationMembers.Status, OrganizationMembers.RoleID 
         FROM OrganizationMembers 
         JOIN Members ON OrganizationMembers.MemberID = Members.MemberID
         WHERE OrganizationMembers.OrganizationID = ? AND OrganizationMembers.SemesterID = ?
         ORDER BY Members.MemberID`,
        [organizationID, semesterID], connection
      );
      return members;
    } catch (err) {
      console.error('Error fetching members:', err);
      throw err;
    }
  }
}

module.exports = OrganizationMember;