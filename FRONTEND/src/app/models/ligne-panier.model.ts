export interface LignePanier {
  id_lignecommande: number;
  id_client: number | null;
  id_maillot: number;
  taille_maillot: string;
  quantite: number;
  prix_ht: number;

  TVA: { taux_tva: number };

  Maillot: {
    id_maillot: number;
    nom_maillot: string;
    url_image_maillot_1: string;
  };
}
