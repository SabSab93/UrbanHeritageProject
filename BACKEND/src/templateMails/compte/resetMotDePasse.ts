// src/templateMails/compte/templateForgotPassword.ts

// On centralise l’URL du front une seule fois, avec fallback local et suppression du slash final
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:4200").replace(/\/$/, "");

/**
 * Template pour l'email de réinitialisation de mot de passe
 */
export const templateForgotPassword = (prenom: string, token: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <h2 style="text-align: center; color: #333333;">Mot de passe oublié ?</h2>
      <p>Bonjour <strong>${prenom}</strong>,</p>
      <p>Nous avons reçu une demande pour réinitialiser votre mot de passe.</p>
      <p>Si vous êtes à l'origine de cette demande, cliquez sur le bouton ci-dessous :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a
          href="${frontendUrl}/reset-password?token=${token}"
          style="
            padding: 12px 24px;
            background-color: #ff6600;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
          "
        >
          🔑 Réinitialiser mon mot de passe
        </a>
      </div>
      <p>Si ce n'était pas vous, ignorez simplement cet email.</p>
      <p>Merci et à bientôt,<br><strong>UrbanHeritage</strong></p>
    </div>
  </div>
`;
