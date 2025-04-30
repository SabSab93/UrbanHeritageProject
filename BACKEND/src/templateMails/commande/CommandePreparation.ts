// src/templateMails/commande/preparationCommande.ts
export const templatePreparationCommande = (
    prenom: string | null,
    idCommande: string
  ) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>🧵 Votre commande est en cours de préparation</h2>
      <p>Bonjour ${prenom ?? "cher·e client·e"},</p>
  
      <p>Nous avons bien reçu votre paiement ! Notre équipe vient de passer
         à l’atelier pour préparer avec le plus grand soin votre commande
         <strong>#${idCommande}</strong> 🪡✨.</p>
  
      <p>Dès qu’elle sera remise au transporteur, vous recevrez un nouvel e-mail
         avec le suivi d’expédition.</p>
  
      <p>Un grand merci pour votre confiance&nbsp;❤️</p>
  
      <p>— L’équipe <strong>UrbanHeritage</strong></p>
    </div>
  `;
  