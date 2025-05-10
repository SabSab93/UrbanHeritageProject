import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Client } from '../../../models/client.model';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';

@Component({
  selector: 'app-donnees-personnelles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donnees-personnelles.component.html',
  styleUrls: ['./donnees-personnelles.component.scss']
})
export class DonneesPersonnellesComponent implements OnInit {
  @Input() client!: Client;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthLoginService
  ) {}

  ngOnInit() {
    // 1) Initialise le formGroup
    this.form = this.fb.group({
      civilite:               [this.client.civilite || 'non_specifie', Validators.required],
      prenom_client:          [this.client.prenom_client ?? '', Validators.required],
      nom_client:             [this.client.nom_client ?? '', Validators.required],
      date_naissance_client:  [''],
      telephone_client:       [ this.client.telephone_client ?? '' ],
      adresse_client:         [this.client.adresse_client ?? '', Validators.required],
      code_postal_client:     [this.client.code_postal_client ?? '', Validators.required],
      ville_client:           [this.client.ville_client ?? '', Validators.required],
      pays_client:            [this.client.pays_client ?? '', Validators.required],
    });

    // 2) Formate et patch la date de naissance en YYYY-MM-DD
    if (this.client.date_naissance_client) {
      const d = new Date(this.client.date_naissance_client);
      const iso = d.toISOString().split('T')[0];  // "YYYY-MM-DD"
      this.form.get('date_naissance_client')!.setValue(iso);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    // 1. Récupère uniquement les valeurs modifiées
    const formValues = this.form.value as Partial<Client>;

    // 2. Supprime id_role s'il existe
    delete (formValues as any).id_role;

    // 3. Appelle le service avec l'ID et les données autorisées
    this.auth
      .updateClient(this.client.id_client, formValues)
      .subscribe({
        next: () => alert('Données personnelles mises à jour.'),
        error: (e: any) =>
          alert('Erreur lors de l’enregistrement : ' + e.message)
      });
  }

  onChangePassword() {
    // Ex. : this.router.navigate(['/profil/change-password']);
    console.log('Changement de mot de passe');
  }

  onDeleteAccount() {
    if (confirm('Voulez-vous vraiment supprimer votre compte ?')) {
      this.auth.deleteAccount(this.client.id_client).subscribe({
        next: () => {
          alert('Compte supprimé.');
          this.auth.logout();
        },
        error: (err: any) => alert('Erreur : ' + err.message)
      });
    }
  }
}
