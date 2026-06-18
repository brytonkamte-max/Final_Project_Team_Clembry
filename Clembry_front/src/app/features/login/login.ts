import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authServ:Auth  = inject(Auth);
  private router: Router = inject(Router);

  // Form group pulito: username e password sono gli unici campi richiesti dal backend
  loginForm: FormGroup = new FormGroup({
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', Validators.required),
  });

  onLogin(): void {
    // Se il form non è valido (es. campi vuoti), blocchiamo l'invio
    if (!this.loginForm.valid) {
      return;
    }

    // Estraiamo username e password inseriti dall'utente
    const credentials = this.loginForm.getRawValue();

    // Chiamiamo il metodo login del servizio che effettua la POST al backend
    this.authServ.login(credentials).subscribe({
      next: (user) => {
        console.log('Login effettuato con successo! Dati utente:', user);
        
        // Il reindirizzamento si basa sul ruolo reale restituito dal database
        const targetRoute = user.role === 'teacher' ? '/teacherPersonalArea' : '/personalArea';
        this.router.navigateByUrl(targetRoute);
      },
      error: (err) => {
        console.error('Errore durante il login:', err);
        
        // Resettiamo il form per sicurezza
        this.loginForm.reset();
        
        // Mostriamo il messaggio d'errore inviato dal server (es. "Credenziali non valide")
        alert(err.error?.error || 'Impossibile connettersi al server. Riprova più tardi.');
      }
    });
  }
}