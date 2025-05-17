// src/templateMails/compte/activationCompte.ts

/**
 * Template pour l'email d'activation de compte.
 * Retourne à la fois le HTML (avec bouton) et le texte brut (lien) pour les clients mail en plain-text.
 */
export function templateActivationCompte(prenom: string, token: string) {
  // FRONTEND_URL défini sur Render → sinon on retombe sur ton domaine prod en dur
  const frontendUrl =
    process.env.FRONTEND_URL ||
    "https://urban-heritage-project.vercel.app";

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff;
                  padding: 20px; border-radius: 8px;">
        <h2 style="text-align: center; color: #333333;">
          Bienvenue chez <span style="color: #ff6600;">UrbanHeritage</span> !
        </h2>
        <p>Bonjour <strong>${prenom}</strong>,</p>
        <p>Merci de vous être inscrit(e) sur notre site. 🎉</p>
        <p>
          Pour finaliser votre inscription et activer votre compte,
          veuillez cliquer sur le bouton ci-dessous :
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${frontendUrl}/activation?token=${token}"
            style="
              padding: 12px 24px;
              background-color: #ff6600;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
            "
          >
            Activer mon compte
          </a>
        </div>
        <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.</p>
        <p>À très vite sur <strong>UrbanHeritage</strong> !</p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #777777;">
          UrbanHeritage — Créations solidaires et uniques 🌍
        </p>
      </div>
    </div>
  `;

  const text = `Activez votre compte en cliquant sur ce lien :\n\n${frontendUrl}/activation?token=${token}`;

  return { html, text };
}
