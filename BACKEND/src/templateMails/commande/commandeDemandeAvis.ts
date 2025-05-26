
import { FRONTEND_URL } from "../../config"

const frontendUrl = FRONTEND_URL;
export const templateDemandeAvis = (
  prenom_client: string,
  id_maillot: number,
  nom_maillot: string
) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Votre avis compte pour nous ! 🌟</h2>
    <p>Bonjour ${prenom_client},</p>
    <p>Nous espérons que vous êtes ravi(e) de votre maillot <strong>${nom_maillot}</strong> !</p>
    <p>Votre retour est précieux pour nous et pour les autres fans 🏆.</p>
    <p><strong>En quelques clics</strong>, donnez votre avis :</p>
    <a href="${frontendUrl}/maillot/${id_maillot}/avis"
       style="display: inline-block; padding: 10px 20px; background-color: #004aad; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">
      Donner mon avis
    </a>
    <p style="margin-top: 20px;">Merci beaucoup pour votre soutien 🙏</p>
    <p>L'équipe UrbanHeritage</p>
  </div>
`;