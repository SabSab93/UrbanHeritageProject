
export const templateConfirmationCommande = (prenom: string | null, numeroCommande: string) => `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="background-color: #fff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="text-align: center; color: #777777;">Confirmation de votre commande !</h2>
      <p>Bonjour <strong>${prenom || "cher client"}</strong>,</p>
      <p>Nous vous confirmons la réception de votre commande <strong>#${numeroCommande}</strong> 🎉</p>
      <p>Notre équipe prépare votre commande avec le plus grand soin.</p>
      <p>Vous recevrez une notification dès que votre commande sera expédiée 🚚.</p>
      <p>Merci de votre confiance,</p>
      <p style="margin-top: 30px;">L'équipe <strong>UrbanHeritage</strong> 🌟</p>
    </div>
  </div>
`;
