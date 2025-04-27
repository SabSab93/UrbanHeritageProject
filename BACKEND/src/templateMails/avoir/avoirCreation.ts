export const templateAvoirCreation = (prenom_client: string, numero_avoir: string) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Votre avoir est disponible 🎁</h2>
    <p>Bonjour ${prenom_client},</p>
    <p>Nous avons bien réceptionné votre retour et avons généré votre avoir :</p>
    <p><strong>Numéro de votre avoir :</strong> ${numero_avoir}</p>
    <p>Notre équipe prépare votre remboursement avec soin : il sera effectué sous 10 jours ouvrés. 🤗</p>
    <p>Merci encore pour votre confiance et à très bientôt sur UrbanHeritage ! ✨</p>
  </div>
`;