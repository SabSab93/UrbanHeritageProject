// src/templateMails/retour/avoirCree.ts

export const templateAvoirCreation = (prenom_client: string, numero_avoir: string) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Votre avoir est disponible 🎁</h2>
    <p>Bonjour ${prenom_client},</p>
    <p>Nous avons bien réceptionné votre retour et avons généré votre avoir :</p>
    <p><strong>Numéro de votre avoir :</strong> ${numero_avoir}</p>
    <p>Vous pouvez l'utiliser lors d'une prochaine commande !</p>
    <p>Merci de votre confiance 🙏</p>
  </div>
`;
