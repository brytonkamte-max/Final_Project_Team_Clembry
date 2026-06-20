import { Component, inject, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth-service';
import { SubscriptionService } from '../../services/subscription-service';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../services/courses-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-area',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './personal-area.html',
  styleUrl: './personal-area.css',
})
export class PersonalArea implements OnInit {
  // Iniezione delle dipendenze
  private authService = inject(Auth);
  private subscriptionService = inject(SubscriptionService);
  private coursesService = inject(CoursesService);
  private router = inject(Router);

  // Esponiamo direttamente il Signal del servizio per il template
  readonly subscriptions = this.subscriptionService.iscrizioni;

  // Recupero utente
  user = this.authService.getCurrentUser();

  // Stato UI
  activeSection: 'bio' | 'payments' | 'courses' | 'calendar' = 'bio';

  // Dati base dai servizi (segnali)
  private subs = this.subscriptionService.iscrizioni;
  private allCourses = this.coursesService.corsi;

  // LA FUNZIONE "COMPOSITORE" (Computed)
  mySubscriptionsDetailed = computed(() => {
    console.log('Esecuzione computed');
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log('Utente non loggato');
      return [];
    }
    
    // Filtriamo le sole sottoscrizioni dell'utente usando s.user_id
    const userSubs = this.subs().filter((s: any) => s.user_id === user.id);

    // Uniamo i dati delle iscrizioni con i dettagli del corso
    return userSubs.map((sub) => {
      const corso = this.allCourses().find((c) => c.id === (sub as any).course_id);

      return {
        ...sub,
        titolo: corso?.titolo || 'N/A',
        descrizione: corso?.descrizione || 'N/A',
        nomeDocente: corso?.docente || 'Docente non trovato',
        materia: corso?.materia || 'N/A',
        prezzo: corso?.prezzo || 0,
        dataOra: corso?.dataOra || 'N/A',
        stelle: corso?.stelle || 0,
        immagine: corso?.immagine || 'N/A',
      };
    });
  });

  // COMPUTED CORRETTO: Forza la conversione da stringa a numero prima di fare calcoli
  calcoloStatistichePagamenti = computed(() => {
    const corsi = this.mySubscriptionsDetailed();
    
    // Eseguiamo la riduzione convertendo ogni stringa prezzo in un vero numero decimale
    const totaleSpeso = corsi.reduce((acc, corso) => {
      const prezzoNumerico = corso.prezzo ? Number(corso.prezzo) : 0;
      return acc + (isNaN(prezzoNumerico) ? 0 : prezzoNumerico);
    }, 0);

    const numeroCorsi = corsi.length;
    const spesaMedia = numeroCorsi > 0 ? (totaleSpeso / numeroCorsi) : 0;

    return {
      totaleSpeso,
      numeroCorsi,
      spesaMedia
    };
  });

  ngOnInit(): void {
    // Controllo sicurezza
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    } else {
      console.log('Utente loggato:', this.user);
    }
  }

  setActiveSection(section: 'bio' | 'payments' | 'courses' | 'calendar'): void {
    this.activeSection = section;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  disiscriviti(courseId: number) {
    const user = this.authService.getCurrentUser();

    if (!user) {
      console.error('Impossibile disiscriversi: utente non trovato.');
      return;
    }
    
    if (confirm("Sei sicuro di voler rimuovere l'iscrizione a questo corso?")) {
      this.subscriptionService.deleteSubscription(user.id, courseId);
    }
  }
}