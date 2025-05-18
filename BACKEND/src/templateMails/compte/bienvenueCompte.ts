// src/templateMails/activationCompte.ts (à adapter aussi pour bienvenueCompte)
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:4200").replace(/\/$/, "");

/**
 * Template pour l'email de bienvenue après activation de compte
 */
export const templateBienvenueCompte = (prenom: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <h2 style="text-align: center; color: #333333;">
        Bienvenue officiellement chez <span style="color: #ff6600;">UrbanHeritage</span> ! 🎉
      </h2>
      <p>Bonjour <strong>${prenom}</strong>,</p>
      <p>
        Votre compte a bien été activé, vous faites désormais partie de l'aventure UrbanHeritage ! 🌍
      </p>
      <p>
        Explorez nos maillots uniques, créez votre propre style, et soutenez des causes 
        qui vous tiennent à cœur. ❤️
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a
          href="${frontendUrl}"
          style="
            padding: 12px 24px;
            background-color: #ff6600;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
          "
        >
          Découvrir la boutique
        </a>
      </div>
      <p>À très vite sur <strong>UrbanHeritage</strong> !</p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #777777;">
        UrbanHeritage — Créations solidaires et uniques 🌟
      </p>
    </div>
  </div>
`;
