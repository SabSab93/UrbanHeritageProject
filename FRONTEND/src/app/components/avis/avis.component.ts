import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute }    from '@angular/router';
import { MaillotService }    from '../maillot/maillot.service';
import { Maillot }           from '../../models/maillot.model';
import { Avis }              from '../../models/avis.model';
import { AuthLoginService }  from '../../services/auth-service/auth-login.service';
import { HeaderComponent }   from '../home-page/shared/header/header.component';
import { FooterComponent }   from '../home-page/shared/footer/footer.component';
import { AvisService }       from '../../services/avis.service';

@Component({
  selector: 'app-avis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './avis.component.html',
  styleUrls: ['./avis.component.scss']
})
export class AvisComponent implements OnInit {
  idMaillot!: number;
  maillot?: Maillot;
  reviewForm!: FormGroup;
  feedback = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private maillotService: MaillotService,
    private authLogin: AuthLoginService,
    private avisService: AvisService
  ) {}

  ngOnInit(): void {
    this.idMaillot = Number(this.route.snapshot.paramMap.get('id'));


    this.reviewForm = this.fb.group({
      note:        [0, [Validators.required, Validators.min(1)]],
      titre:       ['', Validators.required],
      description: ['', Validators.required]
    });


    this.maillotService.getById(this.idMaillot).subscribe({
      next: m => this.maillot = m,
      error: () => this.feedback = 'Impossible de charger le maillot.'
    });
  }

 
  setRating(star: number) {
    this.reviewForm.get('note')!.setValue(star);
  }


  submitAvis() {
    if (this.reviewForm.invalid) {
      this.feedback = 'Merci de remplir tous les champs et de choisir une note.';
      return;
    }
    const clientId = this.authLogin.currentClientId;
    if (!clientId) {
      this.feedback = 'Vous devez être connecté pour laisser un avis.';
      return;
    }

    this.loading = true;

    const payload: Partial<Avis> = {
      id_maillot:       this.idMaillot,
      id_client:        clientId,
      classement_avis:  this.reviewForm.value.note,
      titre_avis:       this.reviewForm.value.titre,
      description_avis: this.reviewForm.value.description
    };

    this.avisService.create(payload).subscribe({
      next: () => {
        this.feedback = 'Merci pour votre avis !';
        this.loading = false;
      },
      error: err => {
        this.feedback = err.error?.message || 'Erreur lors de l’envoi.';
        this.loading = false;
      }
    });
  }
}
