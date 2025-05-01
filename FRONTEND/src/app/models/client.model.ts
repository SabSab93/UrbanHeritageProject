export interface Client {
    id_client: number;
    id_role?: number;
    deleted_at?: Date | null;
    is_anonymised: boolean;
    nom_client: string;
    prenom_client?: string;
    civilite: 'homme' | 'femme' | 'non_specifie'; 
    provider: 'local' | 'google'; 
    google_sub?: string;
    date_naissance_client?: string; 
    adresse_client: string;
    code_postal_client: string;
    ville_client: string;
    pays_client: string;
    mot_de_passe?: string;
    adresse_mail_client: string;
    activation_token?: string;
    statut_compte: 'actif' | 'en_attente' | 'bloque'; 
  }
  