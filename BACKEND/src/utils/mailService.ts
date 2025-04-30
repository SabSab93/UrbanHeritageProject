import nodemailer from "nodemailer";
import fs from "fs";                // ← ajout
import path from "path";

// Transporteur SMTP (Gmail)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ---------- envoi simple (texte ou HTML) -------------------- */
export const sendMail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) =>
  transporter.sendMail({
    from: `"UrbanHeritage" <${process.env.SMTP_USER}>`,
    ...options,
  });

/* ---------- envoi avec pièce jointe (PDF, image, …) --------- */
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
  /* charge le fichier en mémoire et fixe le type MIME */
  const fileBuffer = fs.readFileSync(options.attachmentPath);

  return transporter.sendMail({
    from: `"UrbanHeritage" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: [
      {
        filename: path.basename(options.attachmentPath),
        content: fileBuffer,            // ← buffer binaire
        contentType: "application/pdf", // ← type explicite
      },
    ],
  });
};
