export const templateCommandeRetard = (prenomOrNom: string, idCommande: string) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>⏳ Retard de votre commande</h2>
    <p>Bonjour ${prenomOrNom},</p>
    <p>Nous vous informons que votre commande <strong>#${idCommande}</strong> rencontre un léger retard 🕐.</p>
    <p>Nous faisons tout notre possible pour vous la faire parvenir rapidement.</p>
    <p>Merci pour votre patience et votre compréhension 🙏.</p>
  </div>
`;
