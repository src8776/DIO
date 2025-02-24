const db = require("../config/db");

class OrganizationSetting {
  static async getActiveRequirementByOrg(organizationID) {
    try {
      const query = `
            SELECT 
                ActiveRequirement,
                Description
            FROM 
                OrganizationSettings
            WHERE OrganizationID = ?
        `;
      const [rows] = await db.query(query, [organizationID]);
      return rows;
    } catch (error) {
      console.error('Error fetching Organization Info data:', error);
      throw error;
    }
  }
}

module.exports = OrganizationSetting;