import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Client } from '../../../models/client.model';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-donnees-personnelles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donnees-personnelles.component.html',
  styleUrls: ['./donnees-personnelles.component.scss'],
})
export class DonneesPersonnellesComponent implements OnInit {
  @Input() client!: Client;

  form!: FormGroup;
  passwordForm!: FormGroup;
  showPasswordForm = false;
  isSubmittingPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthLoginService) {}

  ngOnInit() {
    // 1) Initialise le formGroup des données perso
    this.form = this.fb.group({
      civilite:            [this.client.civilite || 'non_specifie', Validators.required],
      prenom_client:       [this.client.prenom_client ?? '', Validators.required],
      nom_client:          [this.client.nom_client ?? '', Validators.required],
      date_naissance_client: [''],
      telephone_client:    [this.client.telephone_client ?? ''],
      adresse_client:      [this.client.adresse_client ?? '', Validators.required],
      code_postal_client:  [this.client.code_postal_client ?? '', Validators.required],
      ville_client:        [this.client.ville_client ?? '', Validators.required],
      pays_client:         [this.client.pays_client ?? '', Validators.required],
    });

    // 2) Initialise le formGroup du mot de passe
    this.passwordForm = this.fb.group(
      {
        oldPassword:     ['', Validators.required],
        newPassword:     ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch }
    );

    // 3) Formate la date de naissance en YYYY-MM-DD
    if (this.client.date_naissance_client) {
      const d = new Date(this.client.date_naissance_client);
      const iso = d.toISOString().split('T')[0];
      this.form.get('date_naissance_client')!.setValue(iso);
    }
  }

  /** Validator cross-field pour vérifier newPassword === confirmPassword */
  private passwordsMatch(group: AbstractControl) {
    const newP = group.get('newPassword')?.value;
    const conf = group.get('confirmPassword')?.value;
    return newP && conf && newP !== conf ? { mismatch: true } : null;
  }

  /** Mise à jour des données perso */
  onSubmit() {
    if (this.form.invalid) return;

    const formValues = this.form.value as Partial<Client>;
    delete (formValues as any).id_role;

    this.auth
      .updateClient(this.client.id_client, formValues)
      .subscribe({
        next: () => alert('Données personnelles mises à jour.'),
        error: (e: any) => alert('Erreur lors de l’enregistrement : ' + e.message),
      });
  }

  /** Affiche le formulaire de changement de mot de passe */
  onChangePassword() {
    this.showPasswordForm = true;
  }

  /** Annule et réinitialise le form mot de passe */
  cancelChangePassword() {
    this.showPasswordForm = false;
    this.passwordForm.reset();
  }

  /** Soumission du changement de mot de passe */
  onSubmitPassword() {
    if (this.passwordForm.invalid) return;

    this.isSubmittingPassword = true;
    const { oldPassword, newPassword } = this.passwordForm.value;

    this.auth
      .changePassword({ oldPassword, newPassword })
      .pipe(finalize(() => (this.isSubmittingPassword = false)))
      .subscribe({
        next: () => {
          alert('Mot de passe mis à jour avec succès.');
          this.cancelChangePassword();
        },
        error: (err: any) =>
          alert('Erreur lors du changement de mot de passe : ' + err.message),
      });
  }

  /** Suppression du compte */
  onDeleteAccount() {
    if (confirm('Voulez-vous vraiment supprimer votre compte ?')) {
      this.auth.deleteAccount(this.client.id_client).subscribe({
        next: () => {
          alert('Compte supprimé.');
          this.auth.logout();
        },
        error: (err: any) => alert('Erreur : ' + err.message),
      });
    }
  }
}
