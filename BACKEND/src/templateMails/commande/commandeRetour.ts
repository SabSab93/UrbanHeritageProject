export const templateCommandeRetour = (prenomOrNom: string, idCommande: string) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>↩️ Retour de votre commande</h2>
    <p>Bonjour ${prenomOrNom},</p>
    <p>Votre commande <strong>#${idCommande}</strong> est actuellement en cours de retour.</p>
    <p>Notre équipe traite votre retour dans les meilleurs délais.</p>
    <p>Merci pour votre confiance 💬.</p>
  </div>
`;
