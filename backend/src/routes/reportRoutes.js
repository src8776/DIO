const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const OrganizationMember = require('../models/OrganizationMember');
const OrganizationSetting = require('../models/OrganizationSetting');
const EventInstance = require('../models/EventInstance');
const Member = require('../models/Member');

router.post('/', async (req, res) => {
    console.log('Received request at /api/admin/report');
    const data = req.body;
    console.log(data);
    //TODO: Retrieve data from database

    const organizationName = await OrganizationSetting.getOrganizationName(data.orgID);
    const memberStats = await OrganizationMember.getMemberStatsByOrgAndSemester(data.orgID, data.selectedSemester.SemesterID);
    const eventCount = await EventInstance.getNumberOfEventInstances(data.orgID, data.selectedSemester.TermCode);
    const shirtSizes = await Member.getShirtSizeCount(data.orgID, data.selectedSemester.SemesterID);
    const pantSizes = await Member.getPantSizeCount(data.orgID, data.selectedSemester.SemesterID);
    const memberReportData = await Member.getMemberReportData(data.orgID, data.selectedSemester.SemesterID); // Add this line
    console.log(shirtSizes, pantSizes);

    const reportDetails = {
        reportName: organizationName + " Report",
        semesterName: data.selectedSemester.TermName,
        orgSummary: {
            totalMembers: memberStats.activeMembers + memberStats.inactiveMembers,
            activeMembers: memberStats.activeMembers,
            inactiveMembers: memberStats.inactiveMembers,
            totalEvents: eventCount,
        },
        clothingSummary: {
            shirtSizes,
            pantSizes
        },
        members: memberReportData,
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

    doc.addPage();

    // Clothing Size Summary
    const clothingSummary = [
        { label: 'Shirt Size', value: 'Quantity (Members)', type: 'header' },
        { label: 'X-Small', value: reportDetails.clothingSummary.shirtSizes['XS'] },
        { label: 'Small', value: reportDetails.clothingSummary.shirtSizes['S'] },
        { label: 'Medium', value: reportDetails.clothingSummary.shirtSizes['M'] },
        { label: 'Large', value: reportDetails.clothingSummary.shirtSizes['L'] },
        { label: 'X-Large', value: reportDetails.clothingSummary.shirtSizes['XL'] },
        { label: '2X-Large', value: reportDetails.clothingSummary.shirtSizes['2XL'] },
        { label: '3X-Large', value: reportDetails.clothingSummary.shirtSizes['3XL'] },
        { label: 'Not set', value: reportDetails.clothingSummary.shirtSizes['null'] },
        { label: '', value: '' },
        { label: 'Pants Size', value: 'Quantity (Members)', type: 'header' },
        ...Object.entries(reportDetails.clothingSummary.pantSizes).map(([size, count]) => ({
            label: size === 'null' ? 'Not set' : `Size ${size}`,
            value: count
        }))
    ];
    drawClothingSummaryTable(doc, 'Clothing Size Summary', clothingSummary, 50, doc.y + 10, 200, 100, 20);

    doc.addPage();

    // List of Members
    const membersList = reportDetails.members.map(member => ({
        FullName: member.FullName,
        Email: member.Email,
        GraduationYear: member.GraduationYear,
        AcademicYear: member.AcademicYear,
        ShirtSize: member.ShirtSize,
        PantSize: member.PantSize
    }));
    drawMembersTable(doc, 'List of Members', membersList, 50, doc.y + 10, [125, 125, 80, 80, 51, 51], 20);

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
    let currentY = startY;
    let isFirstPage = true;

    // Draw table title on the first page
    doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title, startX, currentY);
    currentY += rowHeight * 1.5; // Adjust Y position to account for title

    data.forEach((item, index) => {
        // If the Y position exceeds 730, add a new page
        if (currentY + rowHeight > 730) {
            doc.addPage();
            currentY = doc.y + 10; // Reset to start position on new page
            isFirstPage = false;

            // Draw table title on the new page
            doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title + " (Cont.)", startX, currentY);
            currentY += rowHeight * 1.5;
        }

        // Draw text for the current row
        doc.fillColor('#000000').fontSize(12).font("Helvetica");
        doc.text(item.label, startX, currentY);
        doc.text(item.value, startX + col1Width, currentY);

        // Draw line beneath the row if label and value are not empty
        if (item.value !== '' && item.label !== '') {
            doc.strokeColor('#CCCCCC') // Set stroke color to gray
            .moveTo(startX, currentY + rowHeight - 5)
            .lineTo(startX + col1Width + col2Width, currentY + rowHeight - 5)
            .stroke();
        }

        // Move to the next row
        currentY += rowHeight;
    });
};


const drawMembersTable = (doc, title, data, startX, startY, colWidths, rowHeight) => {
    let currentY = startY;

    // Function to draw table headers
    const drawTableHeader = (index) => {
        printedTitle = index > 0 ? `${title} (Cont.)` : title;
        doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(printedTitle, startX, currentY);
        currentY += rowHeight * 1.5; // Adjust Y for title

        doc.fillColor('#000000').fontSize(12).font("Helvetica-Bold");
        const headers = ['Full Name', 'Email', 'Graduation Year', 'Academic Year', 'Shirt Size', 'Pants Size'];
        headers.forEach((header, index) => {
            doc.text(header, startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, { width: colWidths[index], align: 'left' });
        });

        currentY += rowHeight * 2; // Adjust Y for rows
    };

    drawTableHeader(0); // Draw header for the first page

    data.forEach((item, index) => {
        // Check if new page is needed based on Y position
        if (currentY + rowHeight >= 730) {
            doc.addPage();
            currentY = startY; // Reset Y position
            drawTableHeader(index); // Draw table header on new page
        }

        // Draw row content with text wrapping
        doc.fillColor('#000000').fontSize(12).font("Helvetica");
        const values = [item.FullName, item.Email, item.GraduationYear, item.AcademicYear, item.ShirtSize, item.PantSize];
        let rowHeightUsed = rowHeight; // Track max height used in a row

        values.forEach((value, colIndex) => {
            const colX = startX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
            
            // Get height of wrapped text to determine the tallest column in this row
            const textHeight = doc.heightOfString(value, { width: colWidths[colIndex], align: 'left' });
            rowHeightUsed = Math.max(rowHeightUsed, textHeight + 5); // Ensure row accommodates tallest text
            
            // Draw text with wrapping
            doc.text(value, colX, currentY, { width: colWidths[colIndex], align: 'left' });
        });

        // Draw line beneath the row
        doc.strokeColor('#CCCCCC')
           .moveTo(startX, currentY + rowHeightUsed - 5)
           .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY + rowHeightUsed - 5)
           .stroke();

        currentY += rowHeightUsed; // Move Y for the next row
    });
};




module.exports = router;