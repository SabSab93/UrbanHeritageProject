export interface PersonnalisationInLigne {
  id_personnalisation: number;
  type_personnalisation: 'name' | 'name_color';
  prix_ht: string;
  description: string;
}

export interface LignePanier {
  id_lignecommande: number;
  id_client: number | null;
  id_maillot: number;
  taille_maillot: string;
  quantite: number;
  prix_ht: number;

  // Ajouts pour la perso
  id_personnalisation?: number;
  valeur_personnalisation?: string;
  couleur_personnalisation?: string;
  Personnalisation?: PersonnalisationInLigne;

  TVA: { taux_tva: number };

  Maillot: {
    id_maillot: number;
    nom_maillot: string;
    url_image_maillot_1: string;
  };
}
