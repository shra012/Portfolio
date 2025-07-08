// index.js

const nodemailer = require('nodemailer');

// Load environment variables for local development
// In production (Digital Ocean), env vars are automatically available
try {
  require('dotenv').config();
} catch (error) {
  // dotenv not available in production, which is fine
  console.log('Running in production mode - using system environment variables');
}

async function main(args) {
  const name = args.name || 'Stranger';
  const email = args.email;
  const message = args.message;

  console.log('Received contact form submission:', { name, email, message });

  if (!email || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing 'email' or 'message'" })
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email to owner
    const mailOptions = {
      from: `Portfolio Contact <${process.env.FROM_ADDRESS}>`,
      to: process.env.FROM_ADDRESS,
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);

    // Confirmation email to user with enhanced HTML template
    const confirmationMailOptions = {
      from: `Shravankumar Nagarajan <${process.env.FROM_ADDRESS}>`,
      to: email,
      subject: "I've received your message!",
      html: `
       <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Thank You, ${name}</title>
        </head>
        <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px;">
            <p>Hi ${name},</p>

            <p>Thank you for contacting me via my portfolio. I’ve received your message and will get back to you as soon as possible (usually within 1–2 business days).</p>

            <hr />

            <p><strong>Your message:</strong></p>
            <blockquote style="background-color: #f4f4f4; padding: 10px; border-left: 4px solid #ccc;">
            ${message}
            </blockquote>

            <p>If you have additional questions, feel free to reply to this email.</p>

            <p>Best regards,<br />
            Shravankumar Nagarajan<br />
            <a href="https://shra012.github.io/Portfolio">website</a></p>

            <hr />

            <p style="font-size: 12px; color: #777;">
            You received this email because you contacted me on my website. If you did not send this message, please ignore this email.
            </p>
        </body>
        </html>
      `
    };

    await transporter.sendMail(confirmationMailOptions);
    console.log('Confirmation email sent to:', email);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send email.', error: error.message })
    };
  }
}

module.exports.main = main;