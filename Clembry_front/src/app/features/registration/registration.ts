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
  private authService:Auth = inject(Auth);
  private router = inject(Router);
  
  submitted = false;

  regForm: FormGroup = new FormGroup({
    nome: new FormControl<string>('', Validators.required),         // Uniformato al backend (nome)
    cognome: new FormControl<string>('', Validators.required),      // Uniformato al backend (cognome)
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    role: new FormControl<string>('student', Validators.required),  // 'student' invece di 'user'
    terms: new FormControl<boolean>(false, Validators.requiredTrue),
  });

  onSubmit(): void {
    this.submitted = true;

    // Corretto: Procediamo solo se il form è VALIDO
    if (this.regForm.valid) {
      // Estraiamo i dati escludendo il campo 'terms' che non serve al DB
      const { terms, ...payload } = this.regForm.value;

      this.authService.register(payload).subscribe({
        next: (res) => {
          console.log('Registrazione completata con successo:', res);
          alert('Registrazione avvenuta con successo! Verrai reindirizzato al login.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Errore durante la registrazione:', err);
          alert(err.error?.error || 'Errore durante la registrazione.');
        }
      });
    }
  }
}