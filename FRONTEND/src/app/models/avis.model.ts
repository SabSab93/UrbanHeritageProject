export interface Avis {
  id_avis: number;
  id_maillot: number;
  id_client: number;
  classement_avis: number;     // note (1–5)
  titre_avis: string;
  description_avis: string;
  date_avis: string;           // ISO date
  Client?: {
    prenom_client: string;        // ou tout autre champ utile
  };
}