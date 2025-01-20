-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)

-- Table structure for table `Attendance`
--
CREATE DATABASE dio_membership;
DROP TABLE IF EXISTS `Attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Attendance` (
  `AttendanceID` int NOT NULL AUTO_INCREMENT,
  `MemberID` int NOT NULL,
  `EventID` int NOT NULL,
  `CheckInTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `AttendanceStatusID` int NOT NULL,
  `AttendanceSource` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`AttendanceID`),
  UNIQUE KEY `MemberID` (`MemberID`,`EventID`),
  KEY `EventID` (`EventID`),
  KEY `AttendanceStatusID` (`AttendanceStatusID`),
  CONSTRAINT `Attendance_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `Attendance_ibfk_2` FOREIGN KEY (`EventID`) REFERENCES `Events` (`EventID`),
  CONSTRAINT `Attendance_ibfk_3` FOREIGN KEY (`AttendanceStatusID`) REFERENCES `AttendanceStatuses` (`StatusID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AttendanceStatuses`
--

DROP TABLE IF EXISTS `AttendanceStatuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AttendanceStatuses` (
  `StatusID` int NOT NULL AUTO_INCREMENT,
  `StatusName` enum('Attended','Missed','Excused') NOT NULL,
  PRIMARY KEY (`StatusID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EventTypes`
--

DROP TABLE IF EXISTS `EventTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EventTypes` (
  `EventTypeID` int NOT NULL AUTO_INCREMENT,
  `EventTypeName` varchar(50) NOT NULL,
  PRIMARY KEY (`EventTypeID`),
  UNIQUE KEY `EventTypeName` (`EventTypeName`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `EventTypeID` int NOT NULL,
  `EventDate` datetime NOT NULL,
  `EventTitle` varchar(255) NOT NULL,
  PRIMARY KEY (`EventID`),
  KEY `OrganizationID` (`OrganizationID`),
  KEY `EventTypeID` (`EventTypeID`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`),
  CONSTRAINT `Events_ibfk_2` FOREIGN KEY (`EventTypeID`) REFERENCES `EventTypes` (`EventTypeID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Majors`
--

DROP TABLE IF EXISTS `Majors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Majors` (
  `MajorID` int NOT NULL AUTO_INCREMENT,
  `MajorName` varchar(100) NOT NULL,
  PRIMARY KEY (`MajorID`),
  UNIQUE KEY `MajorName` (`MajorName`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Members`
--

DROP TABLE IF EXISTS `Members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Members` (
  `MemberID` int NOT NULL AUTO_INCREMENT,
  `RITUID` varchar(50) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `MajorID` int DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `GraduationYear` year DEFAULT NULL,
  `ShirtSizeID` int DEFAULT NULL,
  PRIMARY KEY (`MemberID`),
  UNIQUE KEY `RITUID` (`RITUID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `MajorID` (`MajorID`),
  KEY `ShirtSizeID` (`ShirtSizeID`),
  CONSTRAINT `Members_ibfk_1` FOREIGN KEY (`MajorID`) REFERENCES `Majors` (`MajorID`),
  CONSTRAINT `Members_ibfk_2` FOREIGN KEY (`ShirtSizeID`) REFERENCES `ShirtSizes` (`SizeID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrganizationConfigs`
--

DROP TABLE IF EXISTS `OrganizationConfigs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrganizationConfigs` (
  `ConfigID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `RequirementType` varchar(100) NOT NULL,
  `RequirementActivity` varchar(100) NOT NULL,
  `MinGeneralMeetings` int DEFAULT '0',
  `MinCommitteeMeetings` int DEFAULT '0',
  `MinVolunteerHours` int DEFAULT '0',
  `LastUpdated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `AdditionalRequirements` json DEFAULT NULL,
  PRIMARY KEY (`ConfigID`),
  KEY `OrganizationID` (`OrganizationID`),
  CONSTRAINT `OrganizationConfigs_ibfk_1` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrganizationMembers`
--

DROP TABLE IF EXISTS `OrganizationMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrganizationMembers` (
  `OrgMemberID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `MemberID` int NOT NULL,
  `JoinDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `RoleID` int NOT NULL,
  PRIMARY KEY (`OrgMemberID`),
  UNIQUE KEY `OrganizationID` (`OrganizationID`,`MemberID`),
  KEY `MemberID` (`MemberID`),
  KEY `RoleID` (`RoleID`),
  CONSTRAINT `OrganizationMembers_ibfk_1` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`),
  CONSTRAINT `OrganizationMembers_ibfk_2` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `OrganizationMembers_ibfk_3` FOREIGN KEY (`RoleID`) REFERENCES `Roles` (`RoleID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Organizations`
--

DROP TABLE IF EXISTS `Organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Organizations` (
  `OrganizationID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(150) NOT NULL,
  `Description` text,
  PRIMARY KEY (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Points`
--

DROP TABLE IF EXISTS `Points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Points` (
  `PointID` int NOT NULL AUTO_INCREMENT,
  `MemberID` int NOT NULL,
  `OrganizationID` int NOT NULL,
  `ActivityDate` date NOT NULL,
  `ActivityType` varchar(50) NOT NULL,
  `PointsEarned` decimal(5,2) NOT NULL,
  `Notes` text,
  PRIMARY KEY (`PointID`),
  KEY `MemberID` (`MemberID`),
  KEY `OrganizationID` (`OrganizationID`),
  CONSTRAINT `Points_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `Points_ibfk_2` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Recognitions`
--

DROP TABLE IF EXISTS `Recognitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Recognitions` (
  `RecognitionID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `MemberID` int NOT NULL,
  `RecognitionYear` year NOT NULL,
  `RecognitionType` varchar(50) NOT NULL,
  PRIMARY KEY (`RecognitionID`),
  KEY `MemberID` (`MemberID`),
  KEY `OrganizationID` (`OrganizationID`),
  CONSTRAINT `Recognitions_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `Recognitions_ibfk_2` FOREIGN KEY (`OrganizationID`) REFERENCES `Organizations` (`OrganizationID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ShirtSizes`
--

DROP TABLE IF EXISTS `ShirtSizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ShirtSizes` (
  `SizeID` int NOT NULL AUTO_INCREMENT,
  `SizeType` enum('XS','S','M','L','XL','2XL') NOT NULL,
  PRIMARY KEY (`SizeID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SignInEvents`
--

DROP TABLE IF EXISTS `SignInEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SignInEvents` (
  `SignInID` int NOT NULL AUTO_INCREMENT,
  `MemberID` int NOT NULL,
  `EventID` int NOT NULL,
  `SignInTime` datetime NOT NULL,
  `SignOutTime` datetime DEFAULT NULL,
  `QRCodeLink` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`SignInID`),
  KEY `MemberID` (`MemberID`),
  KEY `EventID` (`EventID`),
  CONSTRAINT `SignInEvents_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `SignInEvents_ibfk_2` FOREIGN KEY (`EventID`) REFERENCES `Events` (`EventID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
