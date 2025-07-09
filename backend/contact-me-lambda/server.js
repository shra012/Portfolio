const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: ['https://shra012.github.io/Portfolio', 'http://localhost:5173'],
    methods: ['POST', 'GET'],
    credentials: false
}));
app.use(express.json());

app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    console.log('Received contact form submission:', { name, email, message });
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to you
    const mailOptions = {
        from: `Portfolio Contact <${process.env.FROM_ADDRESS}>`,
        to: process.env.FROM_ADDRESS,
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        // Confirmation email to user
        const confirmationMailOptions = {
            from: `Shravankumar Nagarajan <${process.env.FROM_ADDRESS}>`,
            to: email,
            subject: "I've received your message!",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Message Received</title>
                </head>
                <body style="margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 40px 30px; text-align: center; position: relative;">
                            <div style="position: absolute; top: 15px; right: 20px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">
                                🤖 Automated Response
                            </div>
                            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                                ✉️
                            </div>
                            <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Message Received!</h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for reaching out, ${name}</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <div style="margin-bottom: 30px;">
                                <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 20px; font-weight: 600;">Hi ${name}! 👋</h2>
                                <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for contacting me through my portfolio website. This is an automated confirmation that I've successfully received your message.
                                </p>
                                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: 500;">
                                        ⏱️ I typically respond within 24-48 hours. I'll get back to you as soon as possible!
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Message Preview -->
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
                                <h3 style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                                    <span style="margin-right: 8px;">📝</span> Your Message:
                                </h3>
                                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; color: #1f2937; font-size: 15px; line-height: 1.5; font-style: italic;">
                                    "${message}"
                                </div>
                            </div>
                            
                            <!-- Footer -->
                            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
                                <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">
                                    Best regards,<br/>
                                    <strong style="color: #1f2937; font-size: 16px;">Shravankumar Nagarajan</strong>
                                </p>
                                <div style="margin-top: 20px;">
                                    <a href="https://shra012.github.io/Portfolio" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-size: 14px; font-weight: 500; transition: all 0.3s ease;">
                                        🌐 Visit My Portfolio
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bottom Notice -->
                        <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.4;">
                                🤖 This is an automated message. Please do not reply to this email.<br/>
                                If you need immediate assistance, please visit my portfolio website.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        await transporter.sendMail(confirmationMailOptions);
        console.log('Confirmation email sent to:', email);
        return res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email.', error });
    }
});

module.exports = app;