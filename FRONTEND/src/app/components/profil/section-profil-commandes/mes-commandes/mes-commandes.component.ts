import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { CommandeService } from '../../../../services/commande.service';
import { Commande } from '../../../../models/commande.model';
import { DetailsCommandeComponent } from '../detail-commande/detail-commande.component';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, DetailsCommandeComponent],
  templateUrl: './mes-commandes.component.html',
})
export class MesCommandesComponent implements OnInit {
  commandes: Commande[] = [];
  loading = true;
  error: string | null = null;

  // ID de la commande sélectionnée (null = affichage de la liste)
  selectedCommandeId: number | null = null;

  constructor(private service: CommandeService) {}

  ngOnInit() {
    this.loadList();
  }

  private loadList() {
    this.loading = true;
    this.error = null;
    this.service.getMesCommandes().subscribe({
      next: cmds => {
        this.commandes = cmds;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos commandes.';
        this.loading = false;
      }
    });
  }

  /** Appelé quand on clique sur "Détails" */
  showDetails(id: number) {
    this.selectedCommandeId = id;
  }

  /** Retour à la liste */
  backToList() {
    this.selectedCommandeId = null;
  }
}
