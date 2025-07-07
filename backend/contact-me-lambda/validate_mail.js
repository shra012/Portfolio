// test-gmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmail() {
  console.log('Creating transporter...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  console.log('Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP verified and ready to send.');
  } catch (err) {
    return console.error('❌ SMTP verification failed:', err);
  }

  console.log('Sending test email...');
  try {
    const info = await Promise.race([
      transporter.sendMail({
        from: `"Test" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: 'Nodemailer Gmail SMTP Test',
        text: 'This is a <test> email from Nodemailer using Gmail SMTP!',
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('sendMail timeout')), 15000)
      ),
    ]);

    console.log('✅ Email sent! Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
  }
}

testGmail();