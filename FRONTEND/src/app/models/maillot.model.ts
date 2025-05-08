// src/app/maillot/maillot.model.ts
export interface Maillot {
  id_maillot:         number;
  id_artiste:         number;
  id_association:     number;
  id_tva:             number;
  nom_maillot:        string;
  pays_maillot:       string;
  description_maillot: string;
  composition_maillot: string;
  url_image_maillot_1: string;
  url_image_maillot_2: string;
  url_image_maillot_3: string;
  origine:            string;
  tracabilite:        string;
  entretien:          string;
  prix_ht_maillot:    number;
  created_at:         string;
  quantite_vendue:    number;
}
