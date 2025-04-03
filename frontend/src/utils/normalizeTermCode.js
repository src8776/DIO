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
export function normalizeTermCode(termCode) {
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