export interface Personnalisation {
  id_personnalisation: number;
  type_personnalisation: 'name' | 'name_color';
  prix_ht: string;    
  description: string;
}