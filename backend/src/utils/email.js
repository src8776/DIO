const nodemailer = require('nodemailer');
const OrganizationSetting = require('../models/OrganizationSetting');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dreamteamdiotest@gmail.com', // Replace with DIO gmail
        pass: 'ksrv umhe cgvl dglv'    // Replace with club's App Password (16 digit code from gmail)
    }
});

async function sendActiveStatusEmail(organizationID, memberName, memberEmail) {
    try {
        const orgName = await OrganizationSetting.getOrganizationName(organizationID);
        await transporter.sendMail({
            from: `"${orgName}" <dreamteamdiotest@gmail.com>`, // Replace with DIO gmail
            to: memberEmail,
            subject: `Congratulations! You’re Now an Active Member.`,
            text: `Dear ${memberName},\n\nYou’ve met the requirements and are now an active member of the club. Great job!\n\nBest,\nClub Team`,
            html: `<p>Dear ${memberName},</p><p>You’ve met the requirements and are now an <strong>active member</strong> of the club. Great job!</p><p>Best,<br>${orgName} Team</p>`
        });
        console.log(`Email sent to ${memberEmail}`);
    } catch (error) {
        console.error(`Failed to send email to ${memberEmail}:`, error);
    }
}

// Testing email function
// sendActiveStatusEmail(1, 'name', 'youremailhere' )
//     .then(() => console.log('Test email sent successfully'))
//     .catch(console.error);

module.exports = { transporter, sendActiveStatusEmail };