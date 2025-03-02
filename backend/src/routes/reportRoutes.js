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
    const doc = new PDFDocument();
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename="report.pdf"');

    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('RIT DIO Member Dashboard', { align: 'center' });
    doc.fontSize(16).text('Computing Organization for Multicultural Students (COMMS) Report', { align: 'center' });
    doc.fontSize(14).text('Spring Semester 2025\n\n', { align: 'center' });

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

    doc.end();
}

module.exports = router;