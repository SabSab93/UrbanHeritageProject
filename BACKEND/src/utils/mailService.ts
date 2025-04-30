import nodemailer from 'nodemailer';
import path from 'path';

// Création du transporteur ici directement
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Fonction d'envoi de mail classique (texte ou HTML)
export const sendMail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) => {
  return await transporter.sendMail({
    from: `"UrbanHeritage" <${process.env.SMTP_USER}>`,
    ...options,
  });
};

// Interface pour l'envoi avec pièce jointe
interface SendMailWithAttachmentOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachmentPath: string;
}

// Fonction d'envoi d'un mail avec pièce jointe
export const sendMailWithAttachment = async (options: SendMailWithAttachmentOptions) => {
  return await transporter.sendMail({
    from: `"UrbanHeritage" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    attachments: [
      {
        filename: path.basename(options.attachmentPath),
        path: options.attachmentPath,
      },
    ],
  });
};
