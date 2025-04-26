export const templateLivraisonConfirmee = (prenomOrNom: string, idCommande: string) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>✅ Votre commande a été livrée !</h2>
    <p>Bonjour ${prenomOrNom},</p>
    <p>Nous sommes heureux de vous confirmer que votre commande <strong>#${idCommande}</strong> a été livrée 🎉.</p>
    <p>Nous espérons que votre nouveau maillot vous plaît !</p>
    <p>À très bientôt sur UrbanHeritage ⚽.</p>
  </div>
`;
