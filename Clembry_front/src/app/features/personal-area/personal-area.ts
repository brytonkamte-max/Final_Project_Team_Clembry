import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth-service';
import { SubscriptionService } from '../../services/subscription-service';
import { CommonModule } from '@angular/common'; // Importa CommonModule per le direttive base (come @if, @for)

@Component({
  selector: 'app-personal-area',
  standalone: true, // Indica che il componente è autonomo
  imports: [CommonModule], // Necessario per usare @if e @for nel template
  templateUrl: './personal-area.html',
  styleUrl: './personal-area.css',
})
export class PersonalArea implements OnInit {

  // Iniezione delle dipendenze: usiamo 'inject' per caricare servizi e router
  authService = inject(Auth);
  subscriptionService = inject(SubscriptionService);
  router = inject(Router);

  // Recuperiamo l'utente corrente dal servizio di autenticazione
  user = this.authService.getCurrentUser();

  // Array locale che conterrà le iscrizioni caricate dal database
  subscriptions: any[] = [];

  // Lifecycle hook: chiamato da Angular quando il componente viene inizializzato
  ngOnInit() {
    // Controllo di sicurezza: se l'utente esiste, carichiamo le sue iscrizioni
    if (this.user?.id) {
      // Chiamiamo il servizio che restituisce un Observable e ci sottoscriviamo
      this.subscriptionService.caricaIscrizioni(this.user.id).subscribe({
        next: (data) => {
          // Quando il dato arriva, lo salviamo nell'array locale
          this.subscriptions = data;
        },
        error: (err) => {
          // Gestione base in caso di errore di connessione
          console.error('Errore nel recupero delle iscrizioni:', err);
        }
      });
    } else {
      // Se non c'è un utente loggato, reindirizziamo al login per sicurezza
      this.router.navigateByUrl('/login');
    }
  }

  // Variabile per gestire quale tab (sezione) mostrare nell'HTML
  activeSection: 'bio' | 'payments' | 'courses' = 'bio';

  // Metodo per cambiare tab quando l'utente clicca sui menu
  setActiveSection(section: 'bio' | 'payments' | 'courses') {
    this.activeSection = section;
  }

  // Metodo di logout: pulisce la sessione e riporta alla pagina di login
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
