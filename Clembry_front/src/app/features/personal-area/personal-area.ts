import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth-service';
import { SubscriptionService } from '../../services/subscription-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-area.html',
  styleUrl: './personal-area.css',
})
export class PersonalArea implements OnInit {
  // Iniezione delle dipendenze
  private authService = inject(Auth);
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  // Esponiamo direttamente il Signal del servizio per il template
  readonly subscriptions = this.subscriptionService.iscrizioni;

  // Recupero utente
  user = this.authService.getCurrentUser();

  // Stato UI
  activeSection: 'bio' | 'payments' | 'courses' | 'calendar' = 'bio';

  ngOnInit(): void {
    // Controllo sicurezza
    if (this.user?.id) {
      // Inneschiamo il caricamento dati nel servizio
      this.subscriptionService.caricaIscrizioni(this.user.id);
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  setActiveSection(section: 'bio' | 'payments' | 'courses' | 'calendar'): void {
    this.activeSection = section;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
