import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../services/courses-service';
import { Auth } from '../../services/auth-service';
import { SubscriptionService, Subscription } from '../../services/subscription-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'],
})
export class Courses {
  private coursesService = inject(CoursesService);
  private authService = inject(Auth);
  private subscriptionService = inject(SubscriptionService);
  router = inject(Router);

  // Filtri come Signals
  materiaSelezionata = signal<string>('');
  ricercaNome = signal<string>('');


  // Lista corsi
  listaCorsi = this.coursesService.corsi;

  user = this.authService.getCurrentUser();

  // Signal calcolato per filtrare i corsi
  corsiFiltrati = computed(() => {
    const lista = this.listaCorsi();
    const filtroMateria = this.materiaSelezionata();
    const testo = this.ricercaNome().toLowerCase().trim();

    return lista.filter((corso) => {
      const matchMateria = filtroMateria ? corso.materia === filtroMateria : true;
      const matchTesto = testo ? corso.titolo.toLowerCase().includes(testo) : true;
      return matchMateria && matchTesto;
    });
  });

  impostaFiltro(materia: string): void {
    this.materiaSelezionata.set(materia);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.ricercaNome.set(input.value);
  }

  // Resetta totalmente entrambi i filtri di ricerca
  resetFiltri(): void {
    this.materiaSelezionata.set('');
    this.ricercaNome.set('');
  }

  // Aggiungi nel componente
 isLoggedIn = this.authService.isLoggedIn;

  // Nel componente
  mySubscribedCourseIds = computed(() => {
    console.log('mySubscribedCourseIds: Esecuzione computed');
    const user = this.authService.getCurrentUser();
    console.log('mySubscribedCourseIds: Utente loggato:', user);
    if (!user) return [];

    // Filtriamo le sole sottoscrizioni dell'utente
    console.log('mySubscribedCourseIds: Sottoscrizioni:', this.subscriptionService.iscrizioni());
    console.log('mySubscribedCourseIds: this.subscriptionService.iscrizioni().filter((s) => s.userId === user.id):', this.subscriptionService.iscrizioni().filter((s) => s.user_id === user.id));
    console.log('mySubscribedCourseIds: this.subscriptionService.iscrizioni().filter((s) => s.userId === user.id).map((s) => s.courseId):', this.subscriptionService.iscrizioni().filter((s) => s.user_id === user.id).map((s) => s.course_id));
    const userSubs = this.subscriptionService
      .iscrizioni()
      .filter((s) => (s as any).user_id === user.id)
      .map((s) => (s as any).course_id);

      // const corso = this.allCourses().find((c) => c.id === (sub as any).course_id);
    console.log('mySubscribedCourseIds: userSubs:', userSubs);
    return userSubs;
  });

  iscrivitiAlCorso(corsoId: number): void {
    const user = this.authService.getCurrentUser();

    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Verifica esistenza
    if (this.subscriptionService.isSubscribed(corsoId, user.id)) {
      alert('Sei già iscritto a questo corso!');
      return;
    }

    // Creazione oggetto coerente
    const nuovaIscrizione: Subscription = {
      user_id: user.id,
      course_id: corsoId,
    };

    this.subscriptionService.addSubscription(nuovaIscrizione);
  }

  ngOnInit() {
  const user = this.authService.getCurrentUser();
  console.log('ngOnInit: Utente loggato:', user);

  if (user) {
    console.log('Carico le iscrizioni per l\'utente:', user.id);
    this.subscriptionService.caricaIscrizioniUser(user.id);
  }
}
}
