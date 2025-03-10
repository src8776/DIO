const db = require('../config/db');

class OrganizationMember {
  // TODO: Need to set this up so members get inserted with the semesterID that matches
  // the attendance file they are coming from
  static async insertOrganizationMember(organizationID, memberID, role = 'Member') {
    try {
      const [[roleResult]] = await db.query(
        'SELECT RoleID FROM Roles WHERE RoleName = ?',
        [role]
      );

      if (!roleResult) {
        console.error(`Role '${role}' does not exist.`);
        return;
      }

      const roleID = roleResult.RoleID;

      const [[exists]] = await db.query(
        'SELECT 1 FROM OrganizationMembers WHERE OrganizationID = ? AND MemberID = ?',
        [organizationID, memberID]
      );

      if (!exists) {
        await db.query(
          `INSERT INTO OrganizationMembers (OrganizationID, MemberID, RoleID)
           VALUES (?, ?, ?)`,
          [organizationID, memberID, roleID]
        );
        console.log(`Added to OrganizationMembers: MemberID ${memberID}, RoleID ${roleID}`);
      }
    } catch (err) {
      console.error('Error inserting into OrganizationMembers:', err);
      throw err;
    }
  }

  static async updateMemberStatus(memberID, organizationID, status, semesterID) {
    try {
      const query = `
            UPDATE OrganizationMembers
            SET Status = ?
            WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?`;
      await db.query(query, [status, memberID, organizationID, semesterID]);
    } catch (error) {
      console.error('Error updating member status in OrganizationMembers:', error);
      throw error;
    }
  }

  static async getMemberStatus(memberID, organizationID, semesterID) {
    try {
      const [[result]] = await db.query(
        `SELECT Status
         FROM OrganizationMembers
         WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?`,
        [memberID, organizationID, semesterID]
      );
      return result?.Status;
    } catch (error) {
      console.error('Error getting member status:', error);
      throw error;
    }
  }

  static async getMemberRole(memberID, organizationID, semesterID) {
    try {
      const query = `
            SELECT Roles.RoleName
            FROM OrganizationMembers
            JOIN Roles ON OrganizationMembers.RoleID = Roles.RoleID
            WHERE OrganizationMembers.MemberID = ? AND OrganizationMembers.OrganizationID = ? AND SemesterID = ?
        `;
      const [[result]] = await db.query(query, [memberID, organizationID, semesterID]);
      return result?.RoleName;
    } catch (error) {
      console.error('Error fetching member role:', error);
      throw error;
    }
  }
}

module.exports = OrganizationMember;