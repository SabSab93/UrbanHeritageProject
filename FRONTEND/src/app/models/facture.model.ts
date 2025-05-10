export interface Facture {
  numero_facture: string;
  id_commande: number;
  date_facture?: string;
  facture_hors_ue?: boolean;
  Commande?: {
    id_commande: number;
    date_commande?: string;
    montant_total_ttc?: number;
    statut_commande: string;
  };
}
