// src/templateMails/commande/confirmationCommande.ts

export const templateConfirmationCommande = (prenom: string, numeroCommande: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <h2 style="text-align: center; color: #333;">Merci pour votre commande, ${prenom} 🎉</h2>
      <p>Votre commande n°<strong>${numeroCommande}</strong> a bien été enregistrée sur <strong>UrbanHeritage</strong>.</p>
      <p>Nous préparons votre colis avec amour ❤️ !</p>
      <p>Vous recevrez un email dès que votre commande sera expédiée 🚚.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/mon-compte/commandes" style="background-color: #ff6600; padding: 12px 24px; color: white; text-decoration: none; border-radius: 5px;">Suivre ma commande</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #999;">Merci pour votre confiance 🙏 - UrbanHeritage</p>
    </div>
  </div>
`;
