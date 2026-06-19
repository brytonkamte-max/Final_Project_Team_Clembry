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
  styleUrls: ['./courses.css']
})
export class Courses {
  private coursesService = inject(CoursesService);
  private authService = inject(Auth);
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  // Filtri come Signals
  materiaSelezionata = signal<string>('');
  ricercaNome = signal<string>('');

  // Lista corsi
  listaCorsi = this.coursesService.corsi;

  // Signal calcolato per filtrare i corsi
  corsiFiltrati = computed(() => {
    const lista = this.listaCorsi();
    const filtroMateria = this.materiaSelezionata();
    const testo = this.ricercaNome().toLowerCase().trim();

    return lista.filter(corso => {
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
  /**
   * Iscrizione al corso con gestione sicura del valore 'user'
   */
  iscrivitiAlCorso(corso: any): void {
    const user = this.authService.getCurrentUser();

    // Gestione sicura del possibile 'null'
    if (!user) {
      alert('Devi essere loggato per iscriverti!');
      this.router.navigate(['/login']);
      return;
    }

    // Verifica esistenza iscrizione
    if (this.subscriptionService.isSubscribed(corso.id, user.id)) {
      alert('Sei già iscritto a questo corso!');
      return;
    }

    // Creazione oggetto coerente con l'interfaccia Subscription
    const nuovaIscrizione: Subscription = {
      userId: user.id,
      courseId: corso.id,
      subscriptionData: new Date().toISOString(),
      titolo: corso.titolo,
      materia: corso.materia,
      dataOra: corso.dataOra,
      immagine: corso.immagine,
      teacherNome: corso.teacher_nome || 'N/A',
      teacherCognome: corso.teacher_cognome || '',
      studentNome: user.nome,
      studentCognome: user.cognome
    };

    this.subscriptionService.addSubscription(nuovaIscrizione);
    alert(`Iscrizione effettuata con successo a: ${corso.titolo}`);
  }
}
