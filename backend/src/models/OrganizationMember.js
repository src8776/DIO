const db = require('../config/db');

class OrganizationMember {
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
          `INSERT INTO OrganizationMembers (OrganizationID, MemberID, Role, RoleID)
           VALUES (?, ?, ?, ?)`,
          [organizationID, memberID, role, roleID]
        );
        console.log(`Added to OrganizationMembers: MemberID ${memberID}, Role ${role}`);
      }
    } catch (err) {
      console.error('Error inserting into OrganizationMembers:', err);
      throw err;
    }
  }
}

module.exports = OrganizationMember;