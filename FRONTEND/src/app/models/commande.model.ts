
import { LignePanier } from './ligne-panier.model';

export type StatutCommande = 
  | 'en_cours'
  | 'en_cours_de_preparation'
  | 'livraison'
  | 'livre'
  | 'retard'
  | 'retour';

export interface Commande {
  id_commande: number;
  id_client: number;
  date_commande: string;          // ISO 8601
  montant_total_ttc: number | null;
  statut_commande: StatutCommande;
  statut_paiement: string;
  LigneCommande: LignePanier[];
}
