import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth-service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  private authService: Auth = inject(Auth);
  private router = inject(Router);
  
  submitted = false;

  regForm: FormGroup = new FormGroup({
    nome: new FormControl<string>('', Validators.required),
    cognome: new FormControl<string>('', Validators.required),
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    role: new FormControl<string>('student', Validators.required),
    terms: new FormControl<boolean>(false, Validators.requiredTrue),
  });

  onSubmit(): void {
    this.submitted = true;

    // Procediamo all'invio solo se il form rispetta le validazioni client-side
    if (this.regForm.valid) {
      // Estraiamo i dati escludendo il campo booleano 'terms' che non serve al database
      const { terms, ...payload } = this.regForm.value;

      this.authService.register(payload).subscribe({
        next: (res) => {
          // 'res' contiene i dati dell'utente autenticato
          console.log('Procedura completata! Utente registrato e connesso all\'aula:', res);
          // Non è necessaria alcuna navigazione router qui: viene eseguita dal tap del servizio
        },
        error: (err) => {
          console.error('Errore durante la registrazione o il login automatico:', err);
          alert(err.error?.error || 'Errore durante il completamento della registrazione.');
        }
      });
    }
  }
}