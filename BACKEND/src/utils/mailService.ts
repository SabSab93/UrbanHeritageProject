// src/utils/mailService.ts
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ** Nouveau ** : tester la connexion SMTP
transporter.verify()
  .then(() => console.log("✅ SMTP connecté et prêt à envoyer des mails"))
  .catch(err => console.error("❌ Impossible de se connecter au SMTP :", err));

export const sendMail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"UrbanHeritage" <${process.env.SMTP_USER}>`,
      ...options,
    });
    console.log("✉️  Mail envoyé:", info.messageId);
    return info;
  } catch (err: any) {
    console.error("❌ Erreur sendMail :", err);
    throw err;
  }
};

interface SendMailWithAttachmentOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachmentPath: string;
}

export const sendMailWithAttachment = async (
  options: SendMailWithAttachmentOptions
) => {
  try {
    const fileBuffer = fs.readFileSync(options.attachmentPath);
    const info = await transporter.sendMail({
      from: `"UrbanHeritage" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: [
        {
          filename: path.basename(options.attachmentPath),
          content: fileBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    console.log("✉️  Mail avec pièce jointe envoyé:", info.messageId);
    return info;
  } catch (err: any) {
    console.error("❌ Erreur sendMailWithAttachment :", err);
    throw err;
  }
};
