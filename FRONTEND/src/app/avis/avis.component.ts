import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }      from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule }        from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { environment }         from '../../environments/environment';

interface Maillot {
  id: number;
  nom_maillot: string;
  url_image_maillot_1: string;
}

@Component({
  selector: 'app-avis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './avis.component.html',
  styleUrls: ['./avis.component.scss']
})
export class AvisComponent implements OnInit {
  idMaillot!: number;
  maillot!: Maillot;
  reviewForm!: FormGroup;
  feedback = '';
  loading = false;

  private readonly baseUrl = `${environment.apiUrl}/avis`;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.idMaillot = Number(this.route.snapshot.paramMap.get('id'));

    // Init du formulaire
    this.reviewForm = this.fb.group({
      note: [0, [Validators.required, Validators.min(1)]],
      commentaire: ['', Validators.required]
    });

    // Chargement du maillot
    this.http
      .get<Maillot>(`${this.baseUrl}/maillot/${this.idMaillot}`)
      .subscribe({
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
    this.loading = true;

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    const payload = {
      data: {
        id_maillot: this.idMaillot,
        note: this.reviewForm.value.note,
        commentaire: this.reviewForm.value.commentaire
      }
    };

    this.http
      .post(`${this.baseUrl}/create`, payload, { headers })
      .subscribe({
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
