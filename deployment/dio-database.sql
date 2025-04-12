-- MySQL SCHEMA for dio_db
-- 
-- This script sets up the predefined database tables for the dio_db database.
-- It includes the creation of necessary tables, insertion of some initial data
-- and the definition of stored procedures and events for managing future semesters.
-- 
-- The script performs the following actions:
-- 1. Enables the event scheduler globally.
-- 2. Creates a user with specific privileges for the database.
-- 3. Creates the dio_db database and switches to it.
-- 4. Defines the structure and relationships for various tables such as Attendance, Colleges, EventInstances, etc.
-- 5. Inserts initial data into tables like Organizations, Colleges, EventRules, EventTypes, Majors, etc.
-- 6. Defines stored procedures for adding future semesters.
-- 7. Sets up scheduled events for updating active semesters and adding future semesters.


--
-- EVENT SCHEDULER enabled for database `dio`
--
SET GLOBAL event_scheduler = ON;


--
-- NEW DATABASE
--
-- Create database before granting privileges
DROP DATABASE IF EXISTS `dio_db`;
CREATE DATABASE `dio_db`;


-- 
-- USER SET UP created for `dio_db`
-- 
-- WARNING: Replace 'secure_password' with a strong, unique password.
CREATE USER 'dio_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'REPLACE_WITH_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON dio.* TO 'dio_user'@'localhost';
FLUSH PRIVILEGES;

USE `dio_db`;


--
-- Database created
--
DROP DATABASE IF EXISTS `dio_db`;
CREATE Database `dio_db`;
USE `dio_db`;


--
-- Table structure for table `Attendance`
--
DROP TABLE IF EXISTS `Attendance`;
CREATE TABLE `Attendance` (
  `AttendanceID` int NOT NULL AUTO_INCREMENT,
  `MemberID` int NOT NULL,
  `EventID` int NOT NULL,
  `CheckInTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `AttendanceStatus` enum('Attended','Missed','Excused') NOT NULL,
  `Hours` int DEFAULT NULL,
  `AttendanceSource` varchar(100) DEFAULT NULL,
  `OrganizationID` int DEFAULT NULL,
  `LastUpdated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AttendanceID`),
  KEY `fk_attendance_organization` (`OrganizationID`),
  KEY `fk_attend_memberID` (`MemberID`),
  KEY `fk_attend_eventID` (`EventID`),
  CONSTRAINT `fk_attend_eventID` FOREIGN KEY (`EventID`) REFERENCES `EventInstances` (`EventID`),
  CONSTRAINT `fk_attend_memberID` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `fk_attendance_organization` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=5160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



--
-- Table structure for table `Colleges`
--
DROP TABLE IF EXISTS `Colleges`;
CREATE TABLE `Colleges` (
  `CollegeID` int NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Abbreviation` char(10) DEFAULT NULL,
  PRIMARY KEY (`CollegeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Colleges`
--

LOCK TABLES `Colleges` WRITE;
/*!40000 ALTER TABLE `Colleges` DISABLE KEYS */;
INSERT INTO `Colleges` VALUES (1,'College of Art and Design','CAD'),(2,'College of Engineering Technology','CET'),(3,'College of Health Sciences and Technology','CHST'),(4,'College of Liberal Arts','COLA'),(5,'College of Science','COS'),(6,'Golisano College of Computing and Information Sciences','GCCIS'),(7,'Golisano Institute for Sustainability','GIS'),(8,'Kate Gleason College of Engineering','KGCOE'),(9,'National Technical Institute for the Deaf','NTID'),(10,'Saunders College of Business','SCOB'),(11,'School of Individualized Study','SOIS');
/*!40000 ALTER TABLE `Colleges` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `EventInstances`
--

DROP TABLE IF EXISTS `EventInstances`;
CREATE TABLE `EventInstances` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `TermCode` char(4) NOT NULL,
  `OrganizationID` int NOT NULL,
  `EventTypeID` int NOT NULL,
  `EventDate` datetime NOT NULL,
  `EventTitle` varchar(255) NOT NULL,
  PRIMARY KEY (`EventID`),
  KEY `idx_event_date` (`EventDate`),
  KEY `fk_event_organizationID` (`OrganizationID`),
  KEY `fk_event_typeID` (`EventTypeID`),
  KEY `TermCode` (`TermCode`),
  CONSTRAINT `EventInstances_ibfk_1` FOREIGN KEY (`TermCode`) REFERENCES `Semesters` (`TermCode`),
  CONSTRAINT `fk_event_organizationID` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`),
  CONSTRAINT `fk_event_typeID` FOREIGN KEY (`EventTypeID`) REFERENCES `EventTypes` (`EventTypeID`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `EventRules`
--

DROP TABLE IF EXISTS `EventRules`;
CREATE TABLE `EventRules` (
  `RuleID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `EventTypeID` int NOT NULL,
  `Criteria` enum('attendance','one off','minimum threshold hours','minimum threshold percentage') DEFAULT NULL,
  `CriteriaValue` decimal(10,2) DEFAULT '0.00',
  `PointValue` int DEFAULT '1',
  `SemesterID` int DEFAULT NULL,
  PRIMARY KEY (`RuleID`),
  UNIQUE KEY `org_event_semester_criteria_value_unique` (`OrganizationID`,`EventTypeID`,`SemesterID`,`Criteria`,`CriteriaValue`),
  KEY `fk_event_rule_organizationID` (`OrganizationID`),
  KEY `fk_event_rule_typeID` (`EventTypeID`),
  KEY `SemesterID` (`SemesterID`),
  CONSTRAINT `EventRules_ibfk_1` FOREIGN KEY (`SemesterID`) REFERENCES `Semesters` (`SemesterID`),
  CONSTRAINT `fk_event_rule_organizationID` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`),
  CONSTRAINT `fk_event_rule_typeID` FOREIGN KEY (`EventTypeID`) REFERENCES `EventTypes` (`EventTypeID`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `EventRules`
--

LOCK TABLES `EventRules` WRITE;
/*!40000 ALTER TABLE `EventRules` DISABLE KEYS */;
INSERT INTO `EventRules` VALUES (94,2,15,'attendance',0.00,1,3),(95,2,15,'minimum threshold percentage',0.50,1,3),(96,2,15,'minimum threshold percentage',0.75,2,3),(97,2,15,'minimum threshold percentage',1.00,3,3),(98,2,16,'attendance',0.00,1,3),(99,2,16,'minimum threshold percentage',0.50,2,3),(100,2,16,'minimum threshold percentage',1.00,3,3),(101,2,17,'minimum threshold hours',1.00,1,3),(102,2,17,'minimum threshold hours',3.00,2,3),(103,2,17,'minimum threshold hours',6.00,3,3),(104,2,17,'minimum threshold hours',9.00,4,3),(105,2,18,'attendance',0.00,1,3),(106,2,18,'one off',0.00,3,3),(107,1,20,'minimum threshold percentage',0.50,1,3),(108,1,21,'minimum threshold percentage',0.50,1,3),(109,1,22,'one off',0.00,1,3),(110,1,23,'one off',0.00,1,3),(112,2,19,'attendance',0.00,1,3),(113,2,24,'attendance',0.00,1,3),(114,2,24,'minimum threshold percentage',0.50,2,3),(115,2,24,'minimum threshold percentage',1.00,3,3),(116,2,25,'attendance',0.00,1,3),(117,2,25,'minimum threshold percentage',0.50,2,3),(118,2,25,'minimum threshold percentage',1.00,3,3),(139,2,33,'attendance',0.00,1,4),(140,2,33,'minimum threshold percentage',0.50,1,4),(141,2,33,'minimum threshold percentage',0.75,2,4),(142,2,33,'minimum threshold percentage',1.00,3,4),(143,2,34,'attendance',0.00,1,4),(144,2,34,'minimum threshold percentage',0.50,2,4),(145,2,34,'minimum threshold percentage',1.00,3,4),(146,2,35,'minimum threshold hours',1.00,1,4),(147,2,35,'minimum threshold hours',3.00,2,4),(148,2,35,'minimum threshold hours',6.00,3,4),(149,2,35,'minimum threshold hours',9.00,4,4),(150,2,36,'attendance',0.00,1,4),(151,2,36,'one off',0.00,3,4),(152,2,37,'attendance',0.00,1,4),(153,2,38,'attendance',0.00,1,4),(154,2,38,'minimum threshold percentage',0.50,2,4),(155,2,38,'minimum threshold percentage',1.00,3,4),(156,2,39,'attendance',0.00,1,4),(157,2,39,'minimum threshold percentage',0.50,2,4),(158,2,39,'minimum threshold percentage',1.00,3,4),(164,1,45,'minimum threshold percentage',0.50,1,4),(165,1,46,'minimum threshold percentage',0.50,1,4),(166,1,47,'one off',0.00,1,4),(167,1,48,'one off',0.00,1,4),(168,2,49,'attendance',0.00,1,1),(169,2,49,'minimum threshold percentage',0.50,1,1),(170,2,49,'minimum threshold percentage',0.75,2,1),(171,2,49,'minimum threshold percentage',1.00,3,1),(172,2,50,'attendance',0.00,1,1),(173,2,50,'minimum threshold percentage',0.50,2,1),(174,2,50,'minimum threshold percentage',1.00,3,1),(175,2,51,'minimum threshold hours',1.00,1,1),(176,2,51,'minimum threshold hours',3.00,2,1),(177,2,51,'minimum threshold hours',6.00,3,1),(178,2,51,'minimum threshold hours',9.00,4,1),(179,2,52,'attendance',0.00,1,1),(180,2,52,'one off',0.00,3,1),(181,2,53,'attendance',0.00,1,1),(182,2,54,'attendance',0.00,1,1),(183,2,54,'minimum threshold percentage',0.50,2,1),(184,2,54,'minimum threshold percentage',1.00,3,1),(185,2,55,'attendance',0.00,1,1),(186,2,55,'minimum threshold percentage',0.50,2,1),(187,2,55,'minimum threshold percentage',1.00,3,1),(189,1,57,'minimum threshold percentage',0.50,1,1),(190,1,58,'minimum threshold percentage',0.50,1,1),(191,1,59,'one off',0.00,1,1),(192,1,60,'one off',0.00,1,1);
/*!40000 ALTER TABLE `EventRules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EventTypes`
--
DROP TABLE IF EXISTS `EventTypes`;
CREATE TABLE `EventTypes` (
  `EventTypeID` int NOT NULL AUTO_INCREMENT,
  `EventType` varchar(50) DEFAULT 'General Meeting',
  `RuleType` enum('Points','Threshold','Hours','Attendance') DEFAULT NULL,
  `MaxPoints` int DEFAULT NULL,
  `MinPoints` int DEFAULT NULL,
  `OccurrenceTotal` int DEFAULT '0',
  `OrganizationID` int NOT NULL,
  `SemesterID` int NOT NULL,
  PRIMARY KEY (`EventTypeID`),
  KEY `fk_event_type_organizationID` (`OrganizationID`),
  KEY `fk_EventTypes_Semesters` (`SemesterID`),
  CONSTRAINT `fk_event_type_organizationID` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`),
  CONSTRAINT `fk_EventTypes_Semesters` FOREIGN KEY (`SemesterID`) REFERENCES `Semesters` (`SemesterID`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `EventTypes`
--

LOCK TABLES `EventTypes` WRITE;
/*!40000 ALTER TABLE `EventTypes` DISABLE KEYS */;
INSERT INTO `EventTypes` VALUES (15,'General Meeting','Points',NULL,NULL,15,2,3),(16,'Community Engagement Committee','Points',NULL,NULL,10,2,3),(17,'Volunteer Event','Points',NULL,NULL,8,2,3),(18,'Mentor Event','Points',9,NULL,5,2,3),(19,'Workshop','Points',NULL,NULL,NULL,2,3),(20,'General Meeting','Threshold',NULL,NULL,15,1,3),(21,'Committee Meeting','Threshold',NULL,NULL,10,1,3),(22,'Social Event','Threshold',NULL,NULL,5,1,3),(23,'Volunteer Event','Threshold',NULL,NULL,8,1,3),(24,'Hackathon Committee','Attendance',NULL,NULL,8,2,3),(25,'Tech Projects Committee','Attendance',NULL,NULL,10,2,3),(33,'General Meeting','Points',NULL,NULL,15,2,4),(34,'Community Engagement Committee','Points',NULL,NULL,10,2,4),(35,'Volunteer Event','Points',NULL,NULL,8,2,4),(36,'Mentor Event','Points',9,NULL,5,2,4),(37,'Workshop','Points',NULL,NULL,NULL,2,4),(38,'Hackathon Committee','Attendance',NULL,NULL,8,2,4),(39,'Tech Projects Committee','Attendance',NULL,NULL,10,2,4),(45,'General Meeting','Threshold',NULL,NULL,15,1,4),(46,'Committee Meeting','Threshold',NULL,NULL,10,1,4),(47,'Social Event','Threshold',NULL,NULL,5,1,4),(48,'Volunteer Event','Threshold',NULL,NULL,8,1,4),(49,'General Meeting','Points',NULL,NULL,15,2,1),(50,'Community Engagement Committee','Points',NULL,NULL,10,2,1),(51,'Volunteer Event','Points',NULL,NULL,8,2,1),(52,'Mentor Event','Points',9,NULL,5,2,1),(53,'Workshop','Points',NULL,NULL,NULL,2,1),(54,'Hackathon Committee','Attendance',NULL,NULL,8,2,1),(55,'Tech Projects Committee','Attendance',NULL,NULL,10,2,1),(57,'General Meeting','Threshold',NULL,NULL,15,1,1),(58,'Committee Meeting','Threshold',NULL,NULL,10,1,1),(59,'Social Event','Threshold',NULL,NULL,5,1,1),(60,'Volunteer Event','Threshold',NULL,NULL,8,1,1);
/*!40000 ALTER TABLE `EventTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Majors`
--
DROP TABLE IF EXISTS `Majors`;
CREATE TABLE `Majors` (
  `MajorID` int NOT NULL,
  `Title` varchar(255) NOT NULL,
  `CollegeID` int DEFAULT NULL,
  PRIMARY KEY (`MajorID`),
  KEY `FK_College_Majors` (`CollegeID`),
  CONSTRAINT `FK_College_Majors` FOREIGN KEY (`CollegeID`) REFERENCES `Colleges` (`CollegeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Majors`
--

LOCK TABLES `Majors` WRITE;
/*!40000 ALTER TABLE `Majors` DISABLE KEYS */;
INSERT INTO `Majors` VALUES (1,'3D Digital Design',1),(2,'3D Graphics Technology',9),(3,'Accounting',10),(4,'Accounting and Financial Analytics',10),(5,'Accounting Technology',10),(6,'Administrative Support Technology',9),(7,'Advertising and Public Relations',4),(8,'Applied Arts and Sciences',11),(9,'Applied Computer Technology',9),(10,'Applied Liberal Arts',9),(11,'Applied Mathematics',5),(12,'Applied Modern Language and Culture',4),(13,'Applied Statistics',5),(14,'Applied Statistics and Data Analytics',5),(15,'Applied Mechanical Technology',9),(16,'Architectural and Civil Drafting Technology',9),(17,'Artificial Intelligence in Computer Science',6),(18,'ASL-English Interpretation',9),(19,'Big Data Analytics',6),(20,'Biochemistry',5),(21,'Biology',5),(22,'Biomedical Engineering',8),(23,'Biomedical Sciences',3),(24,'Biotechnology and Molecular Bioscience',5),(25,'Business Administration (NTID)',9),(26,'Business Administration',10),(27,'Business (NTID)',9),(28,'Business Technology',9),(29,'Chemical Engineering',8),(30,'Civil Engineering Technology',2),(31,'Civil Technology',9),(32,'Community Development and Inclusive Leadership',9),(33,'Computational Mathematics',5),(34,'Computer Engineering',8),(35,'Computer Engineering Technology',2),(36,'Computer Science',6),(37,'Computing and Information Technologies',6),(38,'Computing Security',6),(39,'Criminal Justice',4),(40,'Cybersecurity',6),(41,'Deaf Cultural Studies-American Sign Language',9),(42,'Design and Imaging Technology',9),(43,'Diagnosticdical Sonography (Ultrasound)',3),(44,'Echocardiography (Cardiac Ultrasound)',3),(45,'Economics',4),(46,'Electrical Engineering',8),(47,'Electrical Engineering Technology',2),(48,'Engineering Psychology',8),(49,'Engineering Technology',2),(50,'English',4),(51,'Environmental Science',5),(52,'Environmental Sustainability, Health and Safety',2),(53,'Exercise Science',3),(54,'Film and Animation',1),(55,'Furniture Design',1),(56,'Game Design and Development',6),(57,'General Science',9),(58,'Global Business Management',10),(59,'Global Public Health',3),(60,'Graphic Design',1),(61,'Health Systems Administration',3),(62,'History',4),(63,'Hospitality and Tourism Management',10),(64,'Human-Centered Computing',6),(65,'Humanities, Computing, and Design',4),(66,'Illustration',1),(67,'Imaging Science',5),(68,'Individualized Program',11),(69,'Industrial Design',1),(70,'Industrial Engineering',8),(71,'Integrated Electronics',8),(72,'Interior Design',1),(73,'International and Global Studies',4),(74,'Laboratory Science Technology',9),(75,'Liberal Arts',4),(76,'Management Information Systems (MIS)',10),(77,'Marketing',10),(78,'Materials Science and Engineering',5),(79,'Mechanical Engineering',8),(80,'Mechanical Engineering Technology',2),(81,'Mechatronics Engineering Technology',2),(82,'Medical Illustration',1),(83,'Microelectronic Engineering',8),(84,'Mobile Application Development',9),(85,'Motion Picture Science',1),(86,'Museum Studies',4),(87,'Neuroscience',5),(88,'New Media Design',1),(89,'New Media Interactive Development',6),(90,'Nutritional Sciences',3),(91,'Organizational Change and Leadership',9),(92,'Packaging Science',2),(93,'Performing Arts',9),(94,'Philosophy',4),(95,'Photographic and Imaging Arts',1),(96,'Photographic Arts and Sciences',1),(97,'Photographic Sciences',1),(98,'Political Science',4),(99,'Pre-Baccalaureate Studies in Engineering',9),(100,'Pre-Baccalaureate Studies in Liberal Arts',9),(101,'Pre-Baccalaureate Studies in Science and Mathematics',9),(102,'Pre-Baccalaureate Studies in Visual Communications',9),(103,'Precision Manufacturing Technology',9),(104,'Print and Graphicdia Technology',2),(105,'Sociology and Anthropology',4),(106,'Software Engineering',6),(107,'Studio Arts',1),(108,'Technology Entrepreneurship',10),(109,'Web and Mobile Computing',6),(110,'Women’s, Gender, and Sexuality Studies',4),(111,'Workplace Learning and Instruction',11);
/*!40000 ALTER TABLE `Majors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Members`
--

DROP TABLE IF EXISTS `Members`;
CREATE TABLE `Members` (
  `MemberID` int NOT NULL AUTO_INCREMENT,
  `UserName` varchar(50) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `FullName` varchar(50) DEFAULT NULL,
  `AcademicYear` varchar(50) DEFAULT NULL,
  `ShirtSize` enum('XS','S','M','L','XL','XXL','XXXL') DEFAULT NULL,
  `PantSize` varchar(5) DEFAULT NULL,
  `Gender` enum('Male','Female','Transgender','Nonbinary','Unknown') DEFAULT NULL,
  `Race` varchar(255) DEFAULT NULL,
  `MajorID` int DEFAULT NULL,
  `PhoneNumber` varchar(15) DEFAULT NULL,
  `GraduationSemester` char(4) DEFAULT NULL,
  PRIMARY KEY (`MemberID`),
  UNIQUE KEY `UserName` (`UserName`),
  UNIQUE KEY `Email` (`Email`),
  KEY `FK_Members_Majors` (`MajorID`),
  CONSTRAINT `FK_Members_Majors` FOREIGN KEY (`MajorID`) REFERENCES `Majors` (`MajorID`)
) ENGINE=InnoDB AUTO_INCREMENT=6087 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `OrganizationMembers`
--

DROP TABLE IF EXISTS `OrganizationMembers`;
CREATE TABLE `OrganizationMembers` (
  `OrgMemberID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `MemberID` int NOT NULL,
  `SemesterID` int NOT NULL,
  `JoinDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('Active','Exempt','General','Alumni','CarryoverActive') DEFAULT NULL,
  `RoleID` int NOT NULL,
  PRIMARY KEY (`OrgMemberID`),
  UNIQUE KEY `unique_member_semester` (`OrganizationID`,`MemberID`,`SemesterID`),
  KEY `idx_member` (`MemberID`),
  KEY `idx_organization_id` (`OrganizationID`),
  KEY `idx_role_id` (`RoleID`),
  KEY `fk_semester` (`SemesterID`),
  CONSTRAINT `fk_member` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `fk_organization` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`),
  CONSTRAINT `fk_role_id` FOREIGN KEY (`RoleID`) REFERENCES `Roles` (`RoleID`),
  CONSTRAINT `fk_semester` FOREIGN KEY (`SemesterID`) REFERENCES `Semesters` (`SemesterID`)
) ENGINE=InnoDB AUTO_INCREMENT=2789 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `OrganizationSettings`
--

DROP TABLE IF EXISTS `OrganizationSettings`;
CREATE TABLE `OrganizationSettings` (
  `ConfigID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `ActiveRequirement` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Description` text,
  `SemesterID` int DEFAULT NULL,
  `isFinalized` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ConfigID`),
  UNIQUE KEY `org_semester_unique` (`OrganizationID`,`SemesterID`),
  KEY `OrganizationID` (`OrganizationID`),
  KEY `SemesterID` (`SemesterID`),
  CONSTRAINT `OrganizationSettings_ibfk_1` FOREIGN KEY (`SemesterID`) REFERENCES `Semesters` (`SemesterID`),
  CONSTRAINT `OrganizationSetup_fk_1` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OrganizationSettings`
--

LOCK TABLES `OrganizationSettings` WRITE;
/*!40000 ALTER TABLE `OrganizationSettings` DISABLE KEYS */;
INSERT INTO `OrganizationSettings` VALUES (1,1,4,'2025-02-20 16:05:07','2025-03-09 01:32:47','criteria',4,0),(2,2,18,'2025-02-20 16:05:20','2025-03-09 01:32:47','points',4,0),(3,2,18,'2025-03-17 00:02:53','2025-03-17 00:02:53','points',3,0),(4,1,4,'2025-03-24 18:57:32','2025-03-24 18:57:32','criteria',3,0),(9,2,18,'2025-03-27 17:54:01','2025-03-27 17:54:01','points',1,0),(10,1,4,'2025-04-06 14:55:55','2025-04-06 14:55:55','criteria',1,0);
/*!40000 ALTER TABLE `OrganizationSettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Organizations`
--

DROP TABLE IF EXISTS `Organizations`;
CREATE TABLE `Organizations` (
  `OrganizationID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(150) NOT NULL,
  `Description` text,
  `Abbreviation` char(20) DEFAULT NULL,
  `URL` text,
  `ImagePath` varchar(255) DEFAULT NULL,
  `Image` blob,
  PRIMARY KEY (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Organizations`
--

LOCK TABLES `Organizations` WRITE;
/*!40000 ALTER TABLE `Organizations` DISABLE KEYS */;
INSERT INTO `Organizations` VALUES (1,'Women in Computing','Women in Computing is dedicated to promoting the success and advancement of women and all gender minorities in their academic and professional careers','wic',NULL,NULL,NULL),(2,'Computing Organization for Multicultural Students','The Computing Organization for Multicultural Students is committed to building a supportive community that celebrates the talent of underrepresented students in computing fields','coms',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` enum('Eboard','Member','Admin') DEFAULT 'Member',
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES (3,'Eboard'),(2,'Member'),(1,'Admin');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Semesters`
--

DROP TABLE IF EXISTS `Semesters`;
CREATE TABLE `Semesters` (
  `SemesterID` int NOT NULL AUTO_INCREMENT,
  `TermCode` char(4) NOT NULL,
  `TermName` varchar(20) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `AcademicYear` char(9) NOT NULL,
  `IsActive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`SemesterID`),
  UNIQUE KEY `TermCode` (`TermCode`),
  KEY `AcademicYear` (`AcademicYear`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Semesters`
--

LOCK TABLES `Semesters` WRITE;
/*!40000 ALTER TABLE `Semesters` DISABLE KEYS */;
INSERT INTO `Semesters` VALUES (1,'2231','Fall 2023','2023-08-01','2023-12-31','2023-2024',0),(2,'2235','Spring 2024','2024-01-01','2024-05-31','2023-2024',0),(3,'2241','Fall 2024','2024-08-01','2024-12-31','2024-2025',0),(4,'2245','Spring 2025','2025-01-01','2025-05-31','2024-2025',1);
/*!40000 ALTER TABLE `Semesters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UploadedFilesHistory`
--

DROP TABLE IF EXISTS `UploadedFilesHistory`;
CREATE TABLE `UploadedFilesHistory` (
  `FileID` int NOT NULL AUTO_INCREMENT,
  `FileName` varchar(255) NOT NULL,
  `FileHash` varchar(64) NOT NULL,
  `UploadedBy` varchar(50) DEFAULT NULL,
  `UploadedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FileID`),
  UNIQUE KEY `FileHash` (`FileHash`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- STORED PROCEDURES for Table `Semesters`
--

-- Load the semester dynamically generated based on the current date
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_future_semesters`()
BEGIN
    DECLARE lastTermCode CHAR(4);
    DECLARE lastAcademicYear VARCHAR(9);
    DECLARE nextTermCode CHAR(4);
    DECLARE nextSemesterName VARCHAR(20);
    DECLARE nextStartDate DATE;
    DECLARE nextEndDate DATE;
    DECLARE nextAcademicYear VARCHAR(9);
    DECLARE i INT DEFAULT 0;

    -- Check if Semesters table is empty
    IF (SELECT COUNT(*) FROM Semesters) = 0 THEN
        DECLARE currentYear INT;
        DECLARE currentMonth INT;
        DECLARE baseTermCode CHAR(4);
        DECLARE baseTermName VARCHAR(20);
        DECLARE baseStartDate DATE;
        DECLARE baseEndDate DATE;
        DECLARE baseAcademicYear VARCHAR(9);
        DECLARE yearEnd INT;

        SET currentYear = YEAR(CURDATE());
        SET currentMonth = MONTH(CURDATE());
        SET yearEnd = currentYear + 1;

        IF currentMonth <= 6 THEN
            -- Spring Semester
            SET baseTermCode = CONCAT('2', RIGHT(currentYear, 2), '5');
            SET baseTermName = CONCAT('Spring ', currentYear);
            SET baseStartDate = DATE_FORMAT(CURDATE(), '%Y-01-20');
            SET baseEndDate = DATE_ADD(baseStartDate, INTERVAL 5 MONTH);
            SET baseAcademicYear = CONCAT(currentYear, '-', yearEnd);
        ELSE
            -- Fall Semester
            SET baseTermCode = CONCAT('2', RIGHT(currentYear, 2), '1');
            SET baseTermName = CONCAT('Fall ', currentYear);
            SET baseStartDate = DATE_FORMAT(CURDATE(), '%Y-08-25');
            SET baseEndDate = DATE_ADD(baseStartDate, INTERVAL 5 MONTH);
            SET baseAcademicYear = CONCAT(currentYear, '-', yearEnd);
        END IF;

        INSERT INTO Semesters (TermCode, TermName, StartDate, EndDate, AcademicYear, IsActive)
        VALUES (baseTermCode, baseTermName, baseStartDate, baseEndDate, baseAcademicYear, 0);
    END IF;

    -- Continue normal flow
    SELECT TermCode, AcademicYear INTO lastTermCode, lastAcademicYear
    FROM Semesters
    ORDER BY SemesterID DESC
    LIMIT 1;

    SET @lastYearStart = LEFT(lastAcademicYear, 4);
    SET @lastYearEnd = RIGHT(lastAcademicYear, 4);

    WHILE i < 4 DO
        IF RIGHT(lastTermCode, 1) = '1' THEN 
            SET nextSemesterName = CONCAT('Spring ', @lastYearEnd);
            SET nextTermCode = CONCAT(LEFT(lastTermCode, 3), '5'); 
            SET nextStartDate = DATE_ADD((SELECT EndDate FROM Semesters WHERE TermCode = lastTermCode), INTERVAL 1 DAY);
            SET nextEndDate = DATE_ADD(nextStartDate, INTERVAL 5 MONTH);
            SET nextAcademicYear = CONCAT(@lastYearStart, '-', @lastYearEnd);
        ELSE 
            SET @nextYearStart = @lastYearEnd;
            SET @nextYearEnd = CAST(@lastYearEnd AS UNSIGNED) + 1;

            SET nextSemesterName = CONCAT('Fall ', @nextYearStart);
            SET nextTermCode = CONCAT('2', SUBSTRING(CAST(@nextYearStart AS CHAR), 3, 2), '1');
            SET nextStartDate = DATE_ADD((SELECT EndDate FROM Semesters WHERE TermCode = lastTermCode), INTERVAL 2 MONTH);
            SET nextEndDate = DATE_ADD(nextStartDate, INTERVAL 5 MONTH);
            SET nextAcademicYear = CONCAT(@nextYearStart, '-', @nextYearEnd);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM Semesters WHERE TermCode = nextTermCode) THEN
            INSERT INTO Semesters (TermCode, TermName, StartDate, EndDate, AcademicYear, IsActive)
            VALUES (nextTermCode, nextSemesterName, nextStartDate, nextEndDate, nextAcademicYear, 0);
        END IF;

        SET lastTermCode = nextTermCode;
        SET lastAcademicYear = nextAcademicYear;
        SET @lastYearStart = LEFT(lastAcademicYear, 4);
        SET @lastYearEnd = RIGHT(lastAcademicYear, 4);
        SET i = i + 1;
    END WHILE;
END ;;
DELIMITER ;

--
-- EVENT SCHEDULERS created for Stored Procedure Add_Future_Semesters()
--

-- Event: Daily update to mark current semester as active
CREATE EVENT `update_active_semester`
ON SCHEDULE EVERY 1 DAY
STARTS '2025-03-28 10:42:52'
ON COMPLETION NOT PRESERVE
ENABLE
DO
BEGIN
    -- Reset all semesters to inactive
    UPDATE Semesters SET IsActive = 0;

    -- Activate current semester (if any)
    UPDATE Semesters
    SET IsActive = 1
    WHERE CURDATE() BETWEEN StartDate AND EndDate;
END;

-- Event: Monthly check to auto-add future semesters
CREATE EVENT `auto_add_future_semesters`
ON SCHEDULE EVERY 1 MONTH
STARTS '2025-03-01 00:00:00'
ON COMPLETION NOT PRESERVE
ENABLE
DO
BEGIN
    -- If fewer than 4 future semesters exist, call the procedure
    IF (
        SELECT COUNT(*)
        FROM Semesters
        WHERE StartDate > CURDATE()
    ) < 4 THEN
        CALL add_future_semesters();
    END IF;
END;

