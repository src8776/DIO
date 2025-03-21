const db = require('../config/db');

class OrganizationMember {
  // TODO: Need to set this up so members get inserted with the semesterID that matches
  // the attendance file they are coming from
  static async insertOrganizationMember(organizationID, memberID, semesterID, role = 'Member') {
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
        'SELECT 1 FROM OrganizationMembers WHERE OrganizationID = ? AND MemberID = ? AND SemesterID = ?',
        [organizationID, memberID, semesterID]
      );

      if (!exists) {
        await db.query(
          `INSERT INTO OrganizationMembers (OrganizationID, MemberID, SemesterID, RoleID)
           VALUES (?, ?, ?, ?)`,
          [organizationID, memberID, semesterID, roleID]
        );
        console.log(`Added to OrganizationMembers: MemberID ${memberID}, RoleID ${roleID}, SemesterID ${semesterID}`);
      }
    } catch (err) {
      console.error('Error inserting into OrganizationMembers:', err);
      throw err;
    }
  }

  static async updateMemberStatus(memberID, organizationID, status, semesterID) {
    // Update if exists, insert if not (upsert logic might be needed)
    const [existing] = await db.query(
      `SELECT 1 FROM OrganizationMembers WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?`,
      [memberID, organizationID, semesterID]
    );
    if (existing.length > 0) {
      await db.query(
        `UPDATE OrganizationMembers SET Status = ? WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?`,
        [status, memberID, organizationID, semesterID]
      );
    } else {
      await db.query(
        `INSERT INTO OrganizationMembers (MemberID, OrganizationID, status, semesterID) VALUES (?, ?, ?, ?)`,
        [memberID, organizationID, status, semesterID]
      );
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

  static async getMemberStatsByOrgAndSemester(organizationID, semesterID) {
    try {
        const query = `
            SELECT 
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activeMembers,
                SUM(CASE WHEN Status = 'Inactive' THEN 1 ELSE 0 END) AS inactiveMembers
            FROM OrganizationMembers
            WHERE OrganizationID = ? AND SemesterID = ?
        `;
        const [[result]] = await db.query(query, [organizationID, semesterID]);
        return {
            activeMembers: parseInt(result.activeMembers),
            inactiveMembers: parseInt(result.inactiveMembers)
        };
    } catch (error) {
        console.error('Error fetching member stats:', error);
        throw error;
    }
  }

  static async getMemberByID(memberID) {
    try {
      const [[member]] = await db.query(
        'SELECT * FROM OrganizationMembers WHERE MemberID = ?',
        [memberID]
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member:', err);
      throw err;
    }
  }

  static async getComsMemberByID(memberID, orgID) {
    try {
      const [[member]] = await db.query(
        'SELECT * FROM OrganizationMembers WHERE MemberID = ? AND OrganizationID = ?',
        [memberID, orgID]
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member:', err);
      throw err;
    }
  }
  
  static async getWicMemberByID(memberID, orgID) {
    try {
      const [[member]] = await db.query(
        'SELECT * FROM OrganizationMembers WHERE MemberID = ? AND OrganizationID = ?',
        [memberID, orgID]
      );
      return member || null;
    } catch (err) {
      console.error('Error fetching member:', err);
      throw err;
    }
  }

}

module.exports = OrganizationMember;