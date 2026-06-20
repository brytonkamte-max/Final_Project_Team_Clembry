import { Component, inject, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth-service';
import { SubscriptionService } from '../../services/subscription-service';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../services/courses-service';
import { TeacherService } from '../../services/teacher-service';
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

  // 1. Dati base dai servizi (segnali)
  private subs = this.subscriptionService.iscrizioni;
  private allCourses = this.coursesService.corsi;

  // 2. LA FUNZIONE "COMPOSITORE" (Computed)
  // Questa funzione si riesegue automaticamente se uno dei segnali sopra cambia
  mySubscriptionsDetailed = computed(() => {
    console.log('Esecuzione computed');
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log('Utente non loggato');
      return [];
    }
    console.log('Utente loggato:', user.id);
    console.log('Sottoscrizioni:', this.subs());
    // Filtriamo le sole sottoscrizioni dell'utente

    // Usa s.user_id invece di s.userId
    const userSubs = this.subs().filter((s: any) => s.user_id === user.id);

    console.log('userSubs:', userSubs);
    // Uniamo i dati
    return userSubs.map((sub) => {
      console.log(this.allCourses());
      // personal-area.ts
      const corso = this.allCourses().find((c) => c.id === (sub as any).course_id);
      // const corso = this.allCourses().find((c) => c.id === sub.courseId);
      console.log('Subscrizione trovata:', sub);
      console.log('Corso trovato:', corso);

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

    // 2. Controllo di sicurezza: se l'utente non esiste, non procediamo
    if (!user) {
      console.error('Impossibile disiscriversi: utente non trovato.');
      return;
    }
    console.log('Utente loggato:', user.id);
    console.log('Corso da disiscrivere:', courseId);
    // 3. Conferma opzionale (ottima pratica UX)
    if (confirm("Sei sicuro di voler rimuovere l'iscrizione a questo corso?")) {
      // 4. Ora user.id è garantito (grazie al controllo !user)

      this.subscriptionService.deleteSubscription(user.id, courseId);
    }
  }
}
