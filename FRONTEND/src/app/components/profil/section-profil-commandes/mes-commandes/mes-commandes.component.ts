import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';

import { CommandeService }   from '../../../../services/commande.service';
import { Commande }          from '../../../../models/commande.model';

import { DetailsCommandeComponent } from '../detail-commande/detail-commande.component';
import { LabelStatutPipe } from '../../../../pipes/label-statut.pipe'; 


@Component({
  selector   : 'app-mes-commandes',
  standalone : true,
  imports    : [
    CommonModule,
    DetailsCommandeComponent,
    LabelStatutPipe         
  ],
  templateUrl: './mes-commandes.component.html',
  styleUrls  : ['./mes-commandes.component.scss'],
})

export class MesCommandesComponent implements OnInit {

  commandes: Commande[] = [];
  loading  = true;
  error: string | null = null;

  selectedCommandeId: number | null = null; // null → liste, sinon détail

  constructor(private commandeService: CommandeService) {}


  ngOnInit(): void {
    this.loadList();
  }


  private loadList(): void {
    this.loading = true;
    this.error   = null;

    this.commandeService.getMesCommandes().subscribe({
      next : cmds => { this.commandes = cmds; this.loading = false; },
      error: ()   => { this.error = 'Impossible de charger vos commandes.'; this.loading = false; }
    });
  }

  /** alias simple pour le bouton Annuler */
  private reloadList(): void { this.loadList(); }

  showDetails(id: number): void { this.selectedCommandeId = id; }

  backToList(): void          { this.selectedCommandeId = null; }

  payer(id: number): void {
    this.commandeService.relancerPaiement(id).subscribe({
      next : r   => window.location.href = r.url,
      error: err => alert(err.error?.message || 'Impossible de relancer le paiement')
    });
  }

  annuler(id: number): void {
    if (!confirm('Annuler définitivement cette commande ?')) return;
    this.commandeService.annulerCommande(id).subscribe({
      next : ()   => this.reloadList(),
      error: err  => alert(err.error?.message || 'Annulation impossible')
    });
  }
}
