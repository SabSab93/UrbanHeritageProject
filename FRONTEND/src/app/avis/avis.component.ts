// src/app/avis/avis.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute }    from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment }       from '../../environments/environment';
import { MaillotService }    from '../maillot/maillot.service';
import { Maillot }           from '../models/maillot.model';
import { Avis }              from '../models/avis.model';
import { AuthLoginService }  from '../services/auth-service/auth-login.service';
import { HeaderComponent }   from '../components/home-page/shared/header/header.component';
import { FooterComponent }   from '../components/home-page/shared/footer/footer.component';

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
    private authLogin: AuthLoginService,      // ← injecté
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // 1) Récupérer l’ID dans l’URL
    this.idMaillot = Number(this.route.snapshot.paramMap.get('id'));

    // 2) Initialiser le formulaire
    this.reviewForm = this.fb.group({
      note:        [0, [Validators.required, Validators.min(1)]],
      titre:       ['', Validators.required],
      description: ['', Validators.required]
    });

    // 3) Charger le maillot
    this.maillotService.getById(this.idMaillot).subscribe({
      next: m => this.maillot = m,
      error: () => this.feedback = 'Impossible de charger le maillot.'
    });
  }

  /** Clic sur une étoile → met à jour la note */
  setRating(star: number) {
    this.reviewForm.get('note')!.setValue(star);
  }

  /** Envoi de l’avis au back selon le modèle Avis */
  submitAvis() {
    if (this.reviewForm.invalid) {
      this.feedback = 'Merci de remplir tous les champs et de choisir une note.';
      return;
    }
    // Récupérer l’ID du client connecté
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
      // date_avis géré côté back
    };

    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${token}`
    });

    this.http.post<{ message: string }>(
      `${environment.apiUrl}/avis/create`,
      { data: payload },
      { headers }
    ).subscribe({
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
