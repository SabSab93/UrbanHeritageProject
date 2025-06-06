export const templateFactureEnvoyee = (prenom: string | null) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="text-align: center; color: #777777;">Votre facture est disponible 🧾</h2>
      <p>Bonjour <strong>${prenom || "cher client"}</strong>,</p>
      <p>Merci beaucoup pour votre commande sur <strong>UrbanHeritage</strong> !</p>
      <p>Veuillez trouver en pièce jointe votre facture officielle 📎.</p>
      <p>Nous espérons que votre nouveau maillot vous plaira autant que nous avons aimé le créer ❤️.</p>
      <p>À très bientôt,</p>
      <p style="margin-top: 30px;">L'équipe <strong>UrbanHeritage</strong> ✨</p>
    </div>
  </div>
`;