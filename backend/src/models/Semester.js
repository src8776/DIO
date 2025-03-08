const db = require('../config/db');

class Semester {
    static async getOrCreateTermCode(checkInDate) {
        const date = new Date(checkInDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JS months are 0-indexed

        let academicYearStart, academicYearEnd;
        let termCode, season;

        // Determine if it's Fall or Spring and set the academic year correctly
        if (month >= 8) { 
            // Fall semester 
            academicYearStart = year;
            academicYearEnd = year + 1;
            termCode = `2${String(year).slice(-2)}1`; // Fall is '1'
            season = 'Fall';
        } else { 
            // Spring semester
            academicYearStart = year - 1;
            academicYearEnd = year;
            termCode = `2${String(academicYearStart).slice(-2)}5`; // Spring is '5'
            season = 'Spring';
        }

        const academicYear = `${academicYearStart}-${academicYearEnd}`;

        console.log(`Term Code: ${termCode}, Academic Year: ${academicYear}`);

        try {
            // check if semester already exists
            const [rows] = await db.query(`SELECT * FROM Semesters WHERE TermCode = ?`, [termCode]);

            if (rows.length > 0) {
                console.log(`[@Semester] Semester already exists for TermCode: ${rows[0].TermCode} for ${season} ${year}`);
                return rows[0].TermCode;
                // return {
                //     TermCode: rows[0].TermCode,
                //     TermName: rows[0].TermName,
                //     AcademicYear: rows[0].AcademicYear,
                //     SemesterID: rows[0].SemesterID
                // };
            }

            // if not found, insert new semester
            const startDate = season === 'Fall' ? `${academicYearStart}-08-01` : `${academicYearEnd}-01-01`;
            const endDate = season === 'Fall' ? `${academicYearStart}-12-31` : `${academicYearEnd}-05-31`;

            const [result] = await db.query(
                `INSERT INTO Semesters (TermCode, TermName, StartDate, EndDate, AcademicYear) VALUES (?, ?, ?, ?, ?)`,
                [termCode, `${season} ${year}`, startDate, endDate, academicYear]
            );

            console.log(`[@Semester] Created new Semester: ${season} ${year} (ID: ${result.insertId})`);
            return termCode;
        } catch (error) {
            console.error(`[@Semester] Error getting or creating Semester for TermCode ${termCode}:`, error);
            return null;
        }
    }
}

module.exports = Semester;

