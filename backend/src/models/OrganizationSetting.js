const db = require("../config/db");
const DBHelper = require('../utils/DBHelper');

class OrganizationSetting {
  static async getActiveRequirementByOrg(organizationID, semesterID, connection = null) {
    try {
      const query = `
            SELECT 
                ActiveRequirement,
                Description
            FROM 
                OrganizationSettings
            WHERE OrganizationID = ? AND SemesterID = ?
        `;
      const [rows] = await DBHelper.runQuery(query, [organizationID, semesterID], connection);
      return rows;
    } catch (error) {
      console.error('Error fetching Organization Info data:', error);
      throw error;
    }
  }

  static async getOrganizationName(organizationID, connection = null) {
    try {
      const query = `
            SELECT 
                Name
            FROM 
                Organizations
            WHERE OrganizationID = ?
        `;
      const [rows] = await DBHelper.runQuery(query, [organizationID], connection);
      return rows.length > 0 ? rows[0].Name : null;
    } catch (error) {
      console.error('Error fetching Organization Name:', error);
      throw error;
    }
  }
}

module.exports = OrganizationSetting;