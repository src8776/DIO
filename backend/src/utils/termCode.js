/**
 * Generates a term code based on an academic year (the Fall year) and term.
 * This academic year spans Fall to Spring.
 *
 * For both Fall and Spring, the term code begins with:
 *   "2" followed by the last two digits of the Fall year.
 *
 * The suffix is determined by the term:
 *   - "1" for Fall
 *   - "5" for Spring
 *
 * Examples:
 *   generateTermCode(2023, "Fall") returns "2231"   // Fall 2023 (academic year 2023-2024)
 *   generateTermCode(2023, "Spring") returns "2235"  // Spring 2024 (academic year 2023-2024)
 *   generateTermCode(2024, "Fall") returns "2241"    // Fall 2024 (academic year 2024-2025)
 *   generateTermCode(2024, "Spring") returns "2245"  // Spring 2025 (academic year 2024-2025)
 *
 * @param {number} academicYear - The starting Fall year of the academic session
 * @param {string} term - The term, either "Spring" or "Fall"
 * @returns {string} The term code
 */
function generateTermCode(academicYear, term) {
    const normalizedTerm = term.toLowerCase();
    let suffix;

    if (normalizedTerm === "fall") {
        suffix = "1";
    } else if (normalizedTerm === "spring") {
        suffix = "5";
    } else {
        throw new Error('Invalid term. Please use "Spring" or "Fall".');
    }
  
    // Convert the academic year to string and take the last two digits
    const yearDigits = academicYear.toString().slice(-2);
    return `2${yearDigits}${suffix}`;
}

/**
 * Converts a term code like "2245" to a human-friendly label like "Spring 2025".
 *
 * Assumes the term code format is:
 *   "2" + (two-digit Fall year) + suffix,
 * where the suffix is:
 *   "1" for Fall (e.g. Fall 2024 for code "2241")
 *   "5" for Spring (e.g. Spring 2025 for code "2245")
 *
 * @param {string} termCode - The term code to normalize.
 * @returns {string} The normalized term label.
 */
function normalizeTermCode(termCode) {
    if (typeof termCode !== 'string' || termCode.length !== 4) {
        return termCode;
    }
    
    // Extract the two-digit year and suffix digit.
    const yearDigits = termCode.slice(1, 3);
    const suffix = termCode.charAt(3);
    const baseYear = parseInt('20' + yearDigits, 10);

    if (suffix === '1') {
        // Fall semester is in the base year.
        return `Fall ${baseYear}`;
    } else if (suffix === '5') {
        // Spring semester is next year.
        return `Spring ${baseYear + 1}`;
    } else {
        return termCode;
    }
}

module.exports = {
    generateTermCode, normalizeTermCode
};