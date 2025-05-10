import { Component, Input, OnInit }       from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Client } from '../../../models/client.model';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';

@Component({
  selector: 'app-donnees-personnelles',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl:'./donnees-personnelles.component.html',
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
    // 1) On initialise le formGroup ici, après que fb soit disponible
    this.form = this.fb.group({
      civilite:               [ this.client.civilite,           Validators.required ],
      prenom_client:          [ this.client.prenom_client ?? '', Validators.required ],
      nom_client:             [ this.client.nom_client,          Validators.required ],
      date_naissance_client:  [ this.client.date_naissance_client ?? '' ],
      adresse_client:         [ this.client.adresse_client,      Validators.required ],
      code_postal_client:     [ this.client.code_postal_client,  Validators.required ],
      ville_client:           [ this.client.ville_client,        Validators.required ],
      pays_client:            [ this.client.pays_client,         Validators.required ],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    // 2) Caster en Partial<Client> pour lever l’erreur de type
    const updated: Partial<Client> = this.form.value as Partial<Client>;

    // 3) Appeler la méthode de mise à jour (à créer si besoin)
    this.auth.updateClient({ ...this.client, ...updated })
      .subscribe({
        next: () => alert('Données personnelles mises à jour.'),
        error: (e: any) =>  alert('Erreur lors de l’enregistrement : ' + e.message)
      });
  }
  onChangePassword() {
    // Par ex. : this.router.navigate(['/profil/change-password']);
    console.log('Changement de mot de passe');
  }

  onDeleteAccount() {
    if (confirm("Voulez-vous vraiment supprimer votre compte ?")) {
      // Appel service pour supprimer
      this.auth.deleteAccount(this.client!.id_client).subscribe({
        next: () => {
          alert('Compte supprimé.');
          this.auth.logout();
        },
        error: err => alert('Erreur : ' + err.message)
      });
    }
  }
}

