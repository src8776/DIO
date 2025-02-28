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

  static async getOrganizationName(organizationID) {
    try {
      const query = `
            SELECT 
                Name
            FROM 
                Organizations
            WHERE OrganizationID = ?
        `;
      const [rows] = await db.query(query, [organizationID]);
      return rows.length > 0 ? rows[0].Name : null;
    } catch (error) {
      console.error('Error fetching Organization Name:', error);
      throw error;
    }
  }
}

module.exports = OrganizationSetting;