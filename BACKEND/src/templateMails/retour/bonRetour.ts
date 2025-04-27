export const templateBonRetour = (prenom_client: string, id_commande: number) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Votre retour est prêt 📦</h2>
    <p>Bonjour ${prenom_client},</p>
    <p>Voici votre bon de retour pour votre commande n°${id_commande}.</p>
    <p><strong>Adresse :</strong><br>UrbanHeritage - Service Retour<br>12 rue de la Victoire, 75000 Paris</p>
    <p>Merci de déposer votre colis à La Poste sous 7 jours.</p>
    <p>À réception, votre avoir sera généré ! 🎁</p>
  </div>
`;
