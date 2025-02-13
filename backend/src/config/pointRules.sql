-- Ensure you have this database 'dio_test' before running this script
Use dio_test;

-- Add ActiveRequirement for Orgs
ALTER TABLE Organizations ADD COLUMN ActiveRequirement INT DEFAULT NULL;

-- Add RequiredPoint for Active in Organizations table
UPDATE Organizations SET ActiveRequirement = 18 WHERE OrganizationID = 2; 

-- Add new table for PointRules
CREATE TABLE `PointRules` (
  `RuleID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `EventType` varchar(100) NOT NULL,
  `TrackingType` enum('Participation','Points') NOT NULL,
  PRIMARY KEY (`RuleID`),
  KEY `FK_OrganizationRules` (`OrganizationID`),
  CONSTRAINT `FK_OrganizationRules` FOREIGN KEY (`OrganizationID`) REFERENCES `organizations` (`OrganizationID`)
) 

CREATE TABLE `PointsRequirements` (
  `RequirementID` int NOT NULL AUTO_INCREMENT,
  `RuleID` int DEFAULT NULL,
  `PointsPer` int DEFAULT NULL,
  `MinRequirement` decimal(5,2) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`RequirementID`),
  KEY `RuleID` (`RuleID`),
  CONSTRAINT `pointsrequirements_ibfk_1` FOREIGN KEY (`RuleID`) REFERENCES `pointrules` (`RuleID`)
)

-- Populate PointRules for WiC
INSERT INTO PointRules (OrganizationID, EventType, TrackingType) VALUES
(1, 'General Meeting', 'Participation'),
(1, 'Committee Meeting', 'Participation'),
(1, 'Social Event', 'Participation'),
(1, 'Volunteer Event', 'Participation');

-- Populate PointRules for COMS
INSERT INTO PointRules (OrganizationID, EventType, TrackingType) VALUES
(2, 'General Meeting', 'Points'),
(2, 'Committee Meeting', 'Points'),
(2, 'Volunteer Event', 'Points'),
(2, 'Mentorship', 'Points'),
(2, 'Town Hall Meeting', 'Points'),
(2, 'Misc. Event', 'Points');

-- Populate those requirements into those tables
-- for WiC
INSERT INTO PointsRequirements (RuleID, PointsPer, MinRequirement, Description) VALUES
(1, NULL, 50.00, 'Attend at least half of the general meetings'),
(2, NULL, 50.00, 'Attend at least half of one specific committee meeting'),
(3, NULL, 1.00, 'Attend at least one social event'),
(4, NULL, 1.00, 'Volunteer for at least one volunteer event');

-- for COMS
INSERT INTO PointsRequirements (RuleID, PointsPer, MinRequirement, Description) VALUES
(5, 1, 1.00, '1 point for attending 1% of general meetings'),
(5, 1, 50.00, '1 point for attending 50% of general meetings'),
(5, 2, 75.00, '2 points for attending 75% of general meetings'),
(5, 3, 100.00, '3 points for attending 100% of general meetings'),
(6, 1, 1.00, '1 point for attending 1% of committee meetings'),
(6, 2, 50.00, '2 points for attending 50% of committee meetings'), 
(6, 3, 100.00, '3 points for attending 100% of committee meetings'),
(7, 1, 0.0, '1 point for volunteering between 1 and 3 hours'),
(7, 2, 0.0, '2 points for volunteering between 3 and 6 hours'),
(7, 3, 0.0, '3 points for volunteering between 6 and 9 hours'), 
(7, 4, 0.0, '4 points for volunteering more than 9 hours'), 
(8, 3, 0.0, '3 points for participation in the Mentorship Program'),
(8, 1, 0.0, '1 point per mentor/mentee meeting'),
(9, 2, 0.0, '2 points for attending town hall meeting'),
(10, 1, 0.0, '1 point for helping COMS');
