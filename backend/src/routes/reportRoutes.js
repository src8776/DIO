const PDFDocument = require('pdfkit');

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Received request at /api/admin/report');
    const data = req.body;
    console.log(data);
    //TODO: Retrieve data from database
    const reportDetails = {
        reportName: "Computing Organization for Multicultural Students (COMS) Report",
        semesterName: "Spring Semester 2025",
        orgSummary: {
            totalMembers: 32,
            activeMembers: 23,
            inactiveMembers: 9,
            totalEvents: 10
        },
        clothingSummary: {
            shirtSizes: {
                small: 9,
                medium: 5,
                large: 9,
                xlarge: 9
            },
            pantSizes: {
                size6: 9,
                size8: 5,
                size16: 9,
                size24: 9
            }
        },
        members: [],
    };
    generateReport(res, reportDetails);
});

const generateReport = (res, reportDetails) => {
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
        doc.fontSize(12).font("Helvetica").text(reportDetails.semesterName, {align: 'right'});
        doc.fontSize(15).font("Helvetica-Bold").text(reportDetails.reportName, 50, 75, {width: 307.2});
        doc.moveDown(1);
        doc.fontSize(10).text('Generated on: ' + new Date().toLocaleString(), 50, doc.y);
        doc.moveDown(1);
    });
    // First page
    doc.addPage();

    // Organization Summary
    const orgSummary = [
        { label: 'Total Number of Members', value: reportDetails.orgSummary.totalMembers },
        { label: 'Percentage of Active Members', value: [Math.round(reportDetails.orgSummary.activeMembers / reportDetails.orgSummary.totalMembers * 100), '%'].join('') },
        { label: 'Percentage of Inactive Members', value: [Math.round(reportDetails.orgSummary.inactiveMembers / reportDetails.orgSummary.totalMembers * 100), '%'].join('') },
        { label: 'Total Number of Events Held', value: reportDetails.orgSummary.totalEvents }
    ];
    drawOrgSummaryTable(doc, 'Organization Summary', orgSummary, 50, doc.y + 10, 200, 100, 20);

    doc.moveDown(2);

    // Clothing Size Summary
    const clothingSummary = [
        { label: 'Shirt Size', value: 'Quantity (Members)', type: 'header' },
        { label: 'Small', value: reportDetails.clothingSummary.shirtSizes.small },
        { label: 'Medium', value: reportDetails.clothingSummary.shirtSizes.medium },
        { label: 'Large', value: reportDetails.clothingSummary.shirtSizes.large },
        { label: 'X-Large', value: reportDetails.clothingSummary.shirtSizes.xlarge },
        { label: '', value: '' },
        { label: 'Pants Size', value: 'Quantity (Members)', type: 'header' },
        { label: 'Size 6', value: reportDetails.clothingSummary.pantSizes.size6 },
        { label: 'Size 8', value: reportDetails.clothingSummary.pantSizes.size8 },
        { label: 'Size 16', value: reportDetails.clothingSummary.pantSizes.size16 },
        { label: 'Size 24', value: reportDetails.clothingSummary.pantSizes.size24 }
    ];
    drawClothingSummaryTable(doc, 'Clothing Size Summary', clothingSummary, 50, doc.y + 10, 200, 100, 20);

    doc.moveDown(2);

    // List of Members
    const membersList = [
        { label: 'Full Name', value: 'Status | Email | Shirt Size | Pants Size' },
        { label: 'Maddie Thompson', value: 'Active | mt2442@rit.edu | Large | 16' },
        { label: 'Lindsey Rubenstein', value: 'Active | lcr1758@rit.edu | Small | 6' }
    ];
    drawMembersTable(doc, 'List of Members', membersList, 50, doc.y + 10, [100, 50, 150, 50, 50], 20);

    // Second page
    doc.addPage();
    doc.text('second page');

    // End the document
    doc.end();
}

const drawOrgSummaryTable = (doc, title, data, startX, startY, col1Width, col2Width, rowHeight) => {
    // Draw table title
    doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title, startX, startY);
    startY += rowHeight / 2; // Adjust startY to account for the title

    // Draw table rows
    doc.fillColor('#000000').fontSize(12).font("Helvetica");
    data.forEach((item, index) => {
        const y = startY + rowHeight * (index + 1);
        doc.text(item.label, startX, y);
        let xlocal = startX + col1Width + col2Width - 30;
        doc.text(item.value, xlocal, y);

        // Draw line beneath the row
        doc.strokeColor('#CCCCCC') // Set stroke color to gray
        .moveTo(startX, y + rowHeight - 5)
        .lineTo(startX + col1Width + col2Width, y + rowHeight - 5)
        .stroke();
    });
}

const drawClothingSummaryTable = (doc, title, data, startX, startY, col1Width, col2Width, rowHeight) => {
    // Draw table title
    doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title, startX, startY);
    startY += rowHeight / 2; // Adjust startY to account for the title

    // Draw table rows
    doc.fillColor('#000000').fontSize(12).font("Helvetica");
    data.forEach((item, index) => {
        const y = startY + rowHeight * (index + 1);
        doc.text(item.label, startX, y);
        doc.text(item.value, startX + col1Width, y);

        // Draw line beneath the row
        if(item.value !== '' && item.label !== '') {
            doc.strokeColor('#CCCCCC') // Set stroke color to gray
            .moveTo(startX, y + rowHeight - 5)
            .lineTo(startX + col1Width + col2Width, y + rowHeight - 5)
            .stroke();
        }
    });
}

const drawMembersTable = (doc, title, data, startX, startY, colWidths, rowHeight) => {
    // Draw table title
    doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title, startX, startY);
    startY += rowHeight; // Adjust startY to account for the title

    // Draw table header
    doc.fillColor('#000000').fontSize(12).font("Helvetica-Bold");
    const headers = ['Full Name', 'Status', 'Email', 'Shirt Size', 'Pants Size'];
    headers.forEach((header, index) => {
        doc.text(header, startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0), startY);
    });

    // Draw table rows
    doc.font("Helvetica");
    data.forEach((item, index) => {
        const y = startY + rowHeight * (index + 1);
        const values = item.value.split(' | ');
        doc.text(item.label, startX, y);
        values.forEach((value, colIndex) => {
            doc.text(value, startX + colWidths.slice(0, colIndex + 1).reduce((a, b) => a + b, 0), y);
        });
        // Draw line beneath the row
        doc.strokeColor('#CCCCCC') // Set stroke color to gray
           .moveTo(startX, y + rowHeight - 5)
           .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y + rowHeight - 5)
           .stroke();
    });
}

module.exports = router;