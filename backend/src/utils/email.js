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
    const mailOptions = {
        from: `"PowerGuard" <${email.user}>`,
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
};