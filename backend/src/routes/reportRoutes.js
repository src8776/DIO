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
    //Retrieve data from database

    const organizationName = await OrganizationSetting.getOrganizationName(data.orgID);
    const memberStats = await OrganizationMember.getMemberStatsByOrgAndSemester(data.orgID, data.selectedSemester.SemesterID);
    const eventCount = await EventInstance.getNumberOfEventInstances(data.orgID, data.selectedSemester.TermCode);
    const shirtSizes = await Member.getShirtSizeCount(data.orgID, data.selectedSemester.SemesterID);
    const pantSizes = await Member.getPantSizeCount(data.orgID, data.selectedSemester.SemesterID);
    const memberReportData = await Member.getMemberReportData(data.orgID, data.selectedSemester.SemesterID, data.filters.memberStatus);

    const reportDetails = {
        reportName: organizationName + " Report",
        semesterName: data.selectedSemester.TermName,
        orgSummary: {
            totalMembers: memberStats.activeMembers + memberStats.generalMembers,
            activeMembers: memberStats.activeMembers,
            generalMembers: memberStats.generalMembers,
            totalEvents: eventCount,
        },
        clothingSummary: {
            shirtSizes,
            pantSizes
        },
        members: memberReportData,
    };
    generateReport(res, data.filters, reportDetails);
});

const generateReport = (res, filters, reportDetails) => {
    let currentPageNumber = 0;

    // Create a new PDF document in landscape mode
    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'letter',
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
        currentPageNumber++;
        doc.image('src/assets/images/RIT_logo.png', { width: 25 });
        doc.font("Helvetica-Bold").fontSize(12).text(' | DIO Member Dashboard', 75, 50);
        doc.fontSize(12).font("Helvetica").text(reportDetails.semesterName, {align: 'right'});
        doc.fontSize(15).font("Helvetica-Bold").text(reportDetails.reportName, 50, 75, {width: 307.2});
        const startY = doc.y;
        const footerText = `Page ${currentPageNumber}`;
        doc.fontSize(10).text(footerText, 50, 550, {align: 'right'});
        doc.y = startY;
    });
    // First page
    doc.addPage();
    doc.moveDown(1);
    doc.fontSize(10).text('Generated on: ' + new Date().toLocaleString(), 50, doc.y);

    // Organization Summary
    const orgSummary = [
        { label: 'Total Number of Members', value: reportDetails.orgSummary.totalMembers },
        { label: 'Percentage of Active Members', value: [Math.round(reportDetails.orgSummary.activeMembers / reportDetails.orgSummary.totalMembers * 100), '%'].join('') },
        { label: 'Percentage of General Members', value: [Math.round(reportDetails.orgSummary.generalMembers / reportDetails.orgSummary.totalMembers * 100), '%'].join('') },
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

    const membersData = [
        { width: 125, header: "Full Name", values: reportDetails.members.map(member => member.FullName) },
        { width: 55, header: "Status", values: reportDetails.members.map(member => member.Status) },
        { width: 100, header: "Email", values: reportDetails.members.map(member => member.Email) },
    ];
    if (filters.includeGraduationYear) {
        membersData.push({ width: 45, header: "Grad. Year", values: reportDetails.members.map(member => member.GraduationYear) });
    }
    if (filters.includeAcademicYear) {
        membersData.push({ width: 95, header: "Academic Year", values: reportDetails.members.map(member => member.AcademicYear) });
    }
    if (filters.includeClothingSize) {
        membersData.push({ width: 72, header: "Shirt / Pant Size", values: reportDetails.members.map(member => (!member.ShirtSize ? "–" : member.ShirtSize) + " / " + (!member.PantSize ? "–" : member.PantSize)) });
    }
    if (filters.includeMajor) {
        membersData.push({ width: 200, header: "Major", values: reportDetails.members.map(member => member.Major) });
    }

    const totalWidth = membersData.reduce((sum, col) => sum + col.width, 0);
    const widthPadding = totalWidth <= 690 ? (692 - totalWidth) / (membersData.length) : 0
    console.log(totalWidth)
    console.log(widthPadding)


    drawMembersTable(doc, 'List of Members', membersData, 50,doc.y + 10, 20, widthPadding);

    // End the document
    doc.end();
}

const drawOrgSummaryTable = (doc, title, data, startX, startY, col1Width, col2Width, rowHeight) => {
    // Draw table title
    doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title, startX, startY);
    startY += rowHeight / 2; // Adjust startY to account for the title

    // Draw table rows
    doc.fillColor('#000000').fontSize(10).font("Helvetica");
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

    // Draw table title on the first page
    doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title, startX, currentY);
    currentY += rowHeight * 1.5; // Adjust Y position to account for title

    data.forEach((item, index) => {
        // If the Y position exceeds 730, add a new page
        if (currentY + rowHeight > 550) {
            doc.addPage();
            currentY = doc.y + 10; // Reset to start position on new page

            // Draw table title on the new page
            doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(title + " (Cont.)", startX, currentY);
            currentY += rowHeight * 1.5;
        }

        // Draw text for the current row
        doc.fillColor('#000000').fontSize(10).font("Helvetica");
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

const drawMembersTable = (doc, title, data, startX, startY, rowHeight, widthPadding) => {
    let currentY = startY;

    const drawTableHeader = (index) => {
        const printedTitle = index > 0 ? `${title} (Cont.)` : title;
        doc.fillColor('#0086A9').fontSize(15).font("Helvetica-Bold").text(printedTitle, startX, currentY);
        currentY += rowHeight * 1.5;

        doc.fillColor('#000000').fontSize(10).font("Helvetica-Bold");
        let colX = startX;
        const headerHeight = rowHeight * 2;

        data.forEach(({ header, width }) => {
            doc.text(header, colX, currentY, { width, align: 'left' });
            colX += width + widthPadding;
        });

        currentY += headerHeight;
    };

    drawTableHeader(0);

    const numRows = data[0].values.length;

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        if (currentY + rowHeight >= 550) {
            doc.addPage();
            currentY = startY;
            drawTableHeader(rowIndex);
        }

        doc.fillColor('#000000').fontSize(10).font("Helvetica");
        let colX = startX;
        let rowHeightUsed = rowHeight;

        data.forEach(({ values, width }) => {
            let value = values[rowIndex];
            const textHeight = doc.heightOfString(value, { width, align: 'left' });
            rowHeightUsed = Math.max(rowHeightUsed, textHeight + 5);
            doc.text(value, colX, currentY, { width, align: 'left' });
            colX += width + widthPadding;
        });

        doc.strokeColor('#CCCCCC')
        .moveTo(startX, currentY + rowHeightUsed - 5)
        .lineTo(startX + data.reduce((sum, col) => sum + col.width + widthPadding, 0), currentY + rowHeightUsed - 5)
        .stroke();

        currentY += rowHeightUsed;
    }
};

module.exports = router;