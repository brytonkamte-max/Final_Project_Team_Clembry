import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../services/courses-service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {
  // Iniettiamo il service dei corsi
  private coursesService = inject(CoursesService);

  // Signals per la gestione dei filtri di ricerca
  materiaSelezionata = signal<string>('');
  ricercaNome = signal<string>('');

  // Otteniamo la lista di sola lettura dal Service
  listaCorsi = this.coursesService.corsi;

  // Signal calcolato combinato: incrocia i filtri di categoria e di testo
  corsiFiltrati = computed(() => {
    let corsi = this.listaCorsi();
    const filtroMateria = this.materiaSelezionata();
    const testoCercato = this.ricercaNome().toLowerCase().trim();

    // 1. Filtro per Categoria/Materia
    if (filtroMateria) {
      corsi = corsi.filter(corso => corso.materia === filtroMateria);
    }

    // 2. Filtro testuale sul titolo del corso
    if (testoCercato) {
      corsi = corsi.filter(corso => 
        corso.titolo.toLowerCase().includes(testoCercato)
      );
    }

    return corsi;
  });

  // Metodo per cambiare la categoria attiva
  impostaFiltro(materia: string): void {
    this.materiaSelezionata.set(materia);
  }

  // Gestore dell'evento di digitazione nella barra di ricerca
  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.ricercaNome.set(inputElement.value);
  }

  // Resetta totalmente entrambi i filtri di ricerca
  resetFiltri(): void {
    this.materiaSelezionata.set('');
    this.ricercaNome.set('');
  }

  iscrivitiAlCorso(idCorso: number): void {
    alert(`Ti sei iscritto con successo al corso numero: ${idCorso}! Riceverai il link di accesso via email.`);
  }
}