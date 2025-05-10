// src/app/components/commandes/mes-factures/mes-factures.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FactureService } from '../../../../services/facture.service';
import { Facture } from '../../../../models/facture.model';

@Component({
  selector: 'app-mes-factures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-factures.component.html',
  styleUrls: ['./mes-factures.component.scss']
})
export class MesFacturesComponent implements OnInit {
  factures: Facture[] = [];
  loading = true;
  error: string | null = null;

  constructor(private service: FactureService) {}

  ngOnInit() {
    this.service.getMesFactures().subscribe({
      next: f => {
        this.factures = f;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos factures.';
        this.loading = false;
      }
    });
  }

  onDownload(f: Facture) {
    this.service.downloadFacture(f.numero_facture).subscribe(blob => {
      // Lancer le téléchargement côté client
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${f.numero_facture}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }, () => {
      alert('Erreur lors du téléchargement.');
    });
  }
}
