export interface Reduction {
  id_reduction: number;
  code_reduction: string;
  description?: string;
  valeur_reduction: string;           
  date_debut_reduction?: string;
  date_fin_reduction?: string;
  type_reduction: string;
  statut_reduction: "active" | "expiree" | "annulee";
  date_creation?: string;
}
