/* src/app/pipes/label-statut.pipe.ts */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'labelStatut', standalone: true })
export class LabelStatutPipe implements PipeTransform {
  transform(value?: string): string {
    return ({
      en_cours:               'Paiement en attente',
      en_cours_de_preparation:'Préparation',
      livraison:              'En livraison',
      livre:                  'Livrée',
      retard:                 'Retard',
      retour:                 'Retour',
    } as any)[value || ''] || value;
  }
}
