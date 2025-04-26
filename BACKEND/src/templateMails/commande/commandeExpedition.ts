export const templateExpeditionCommande = (prenom: string | null, idCommande: string) => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>📦 Votre commande est en cours d'expédition !</h2>
        <p>Bonjour ${prenom || "cher client"},</p>
        <p>Nous avons le plaisir de vous informer que votre commande <strong>#${idCommande}</strong> a été expédiée 🚚.</p>
        <p>Elle est maintenant en route et arrivera très bientôt chez vous !</p>
        <p>Merci infiniment pour votre confiance ❤️</p>
        <p>À très bientôt sur <strong>UrbanHeritage</strong> !</p>
      </div>
    `;
  };