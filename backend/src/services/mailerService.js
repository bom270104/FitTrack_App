import nodemailer from "nodemailer";
import env from "../config/env.js";

const createTransporter = () => {
    if (!env.smtpHost || !env.smtpPort) return null;

    return nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465, // true for 465, false for other ports
        auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    });
};

const transporter = createTransporter();

export function isMailerConfigured() {
    return Boolean(transporter);
}

export async function sendMail({ to, subject, text, html }) {
    if (!transporter) {
        throw new Error("SMTP transporter not configured (set SMTP_HOST/SMTP_PORT)");
    }

    const info = await transporter.sendMail({
        from: env.smtpFrom,
        to,
        subject,
        text,
        html,
    });

    return info;
}

export default { sendMail, isMailerConfigured };
