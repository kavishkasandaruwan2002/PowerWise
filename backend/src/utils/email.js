import nodemailer from 'nodemailer';
import { email } from '../config/env.js';

const transporter = nodemailer.createTransport({
    host: email.host,
    port: email.port,
    secure: false,
    auth: {
        user: email.user,
        pass: email.pass,
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"PowerGuard" <${email.user}>`,
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};