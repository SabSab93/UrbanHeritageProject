import { Maillot } from './maillot.model';

export interface Artiste {
  id_artiste: number;
  nom_artiste: string;
  prenom_artiste: string;
  pays_artiste: string;
  date_naissance_artiste?: string;
  site_web_artiste: string;
  url_image_artiste_1: string;
  url_image_artiste_2: string;
  url_image_artiste_3: string;
  description_artiste_1: string;
  description_artiste_2: string;
  description_artiste_3: string;
  url_instagram_reseau_social?: string;
  url_tiktok_reseau_social?: string;
  maillots?: Maillot[];
}
