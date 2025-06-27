import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandeService } from '../../../../services/commande.service';
import { Commande } from '../../../../models/commande.model';


import { LabelStatutPipe } from '../../../../pipes/label-statut.pipe';

@Component({
  selector: 'app-details-commande',
  standalone: true,
  imports: [
    CommonModule,
    LabelStatutPipe    
  ],
  templateUrl: './detail-commande.component.html',
  styleUrls: ['./detail-commande.component.scss']
})
export class DetailsCommandeComponent implements OnInit, OnChanges {
  @Input() commandeId!: number | null;
  @Output() back = new EventEmitter<void>();

  commande: Commande | null = null;
  loading = false;
  error: string | null = null;

  constructor(private service: CommandeService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['commandeId'] && this.commandeId != null) {
      this.loadCommande(this.commandeId);
    }
  }

  private loadCommande(id: number) {
    this.loading = true;
    this.error = null;
    this.commande = null;

    this.service.getCommande(id).subscribe({
      next: cmd => {
        this.commande = cmd;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger la commande.';
        this.loading = false;
      }
    });
  }

  backToList() {
    this.back.emit();
  }
}
