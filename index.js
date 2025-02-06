require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const emails = require('./emailList.json');
// const nodemailMailgun = require('nodemailer-mailgun-transport');

// const auth = {
//     auth: {
//         api_key: '',
//         domain: '',
//     }
// };
// let transporter = nodemailer.createTransport(nodemailMailgun(auth))

const batchSize = 100; // Example batch size

// SMTP setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.Email_User,
    pass: process.env.Email_Password,
  },
});

// Function to send emails in batches
const sendEmails = async (batchSize) => {
  if (!process.env.Email_User || !process.env.Email_Password) {
    console.error('Missing Email_User or Email_Password environment variables');
    return;
  }

  // Read the HTML template
  const htmlTemplate = fs.readFileSync(path.join(__dirname, 'emailTemplate.html'), 'utf-8');

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const emailPromises = batch.map(email => {
      return transporter.sendMail({
        from: process.env.Email_User,
        to: email,
        subject: "Welcome to Our Service!",
        text: "We're excited to have you on board. Here’s a quick guide to get started.",
        html: htmlTemplate,
      });
    });

    try {
      await Promise.all(emailPromises);
      console.log(`Batch ${i / batchSize + 1} sent successfully.`);
    } catch (error) {
      console.error(`Error in batch ${i / batchSize + 1}:`, error);
    }

    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10-second delay
  }
};

sendEmails(batchSize);
