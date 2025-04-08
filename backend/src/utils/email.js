const nodemailer = require('nodemailer');
const OrganizationSetting = require('../models/OrganizationSetting');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    /*
    host: "smtp-server.rit.edu",
    port: 25, 
    secure: false, // No TLS/SSL
    */
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Replace with DIO gmail
        pass: process.env.GMAIL_PASS   // Replace with club's App Password (16 digit code from gmail)
    }
});

async function sendActiveStatusEmail(organizationID, memberName, memberEmail) {
    console.log(`Sending email to ${memberName}`);
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
 //sendActiveStatusEmail(1, 'name', 'edb2875@rit.edu' )
   //  .then(() => console.log('Test email sent successfully'))
     //.catch(console.error);

module.exports = { transporter, sendActiveStatusEmail };