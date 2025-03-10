const PDFDocument = require('pdfkit');

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Received request at /api/admin/report');
    const data = req.body;
    console.log(data);
    //TODO: Retrieve data from database
    const members = [];
    generateReport(res, members);
});

const generateReport = (res, members) => {
    // Create a new PDF document
    const doc = new PDFDocument({
        margins: { // Set margins in points (1 point = 1/72 inch)
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
        },
        autoFirstPage: false
    });
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename="report.pdf"');

    doc.pipe(res);
    doc.on('pageAdded', () => {
        doc.image('src/assets/images/RIT_logo.png', { width: 25 });
        doc.font("Helvetica-Bold").fontSize(12).text(' | DIO Member Dashboard', 75, 50);
        doc.fontSize(16).text('Computing Organization for Multicultural Students (COMMS) Report', 50);
        doc.fontSize(14).text('Spring Semester 2025\n\n');
    });
    // First page
    doc.addPage();

    // Organization Summary
    doc.fontSize(12).text('Organization Summary:', { underline: true });
    doc.text('Total Number of Members: 32');
    doc.text('Total Number of Active Members: 72%');
    doc.text('Total Number of Inactive Members: 28%');
    doc.text('Total Number of Events Held: 10\n\n');

    // Clothing Size Summary
    doc.text('Clothing Size Summary:', { underline: true });
    doc.text('Shirt Size');
    doc.text('Small: 9');
    doc.text('Medium: 5');
    doc.text('Large: 9');
    doc.text('X-Large: 9');
    doc.text('\nPant Size');
    doc.text('6: 9');
    doc.text('8: 5');
    doc.text('16: 9');
    doc.text('24: 9\n\n');

    // List of Members
    //create a loop to loop through the members array and add them to the pdf
    doc.text('List of Members:', { underline: true });
    doc.text('Full Name               | Status  | Email             | Shirt Size | Pants Size');
    doc.text('Maddie Thompson  | Active | mt2442@rit.edu | Large      | 16');
    doc.text('Lindsey Rubenstein | Active | lcr1758@rit.edu | Small      | 6');

    // Second page
    doc.addPage();
    doc.text('second page');

    // End the document
    doc.end();
}

module.exports = router;