import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherService } from '../../services/teacher-service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css'
})
export class Teachers {
  // Iniettiamo il servizio dei docenti
  private teacherService = inject(TeacherService);

  // Stato dei filtri (Signals)
  materiaSelezionata = signal<string>('');
  ricercaNome = signal<string>('');

  // Prendiamo la lista dei docenti direttamente dal Service
  listaDocenti = this.teacherService.docenti;

  // Signal combinato: si aggiorna se cambia la materia O se l'utente scrive nel cerca
  docentiFiltrati = computed(() => {
    let docenti = this.listaDocents();
    const materia = this.materiaSelezionata();
    const nomeCercato = this.ricercaNome().toLowerCase().trim();

    // 1. Filtro per Materia
    if (materia) {
      docenti = docenti.filter(d => 
        d.materie.some(m => m.toLowerCase() === materia.toLowerCase())
      );
    }

    // 2. Filtro per Nome (Barra di ricerca)
    if (nomeCercato) {
      docenti = docenti.filter(d => 
        d.nome.toLowerCase().includes(nomeCercato)
      );
    }

    return docenti;
  });

  aggiornaFiltro(materia: string): void {
    this.materiaSelezionata.set(materia);
  }

  // Cattura l'evento di digitazione della tastiera (Input)
  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.ricercaNome.set(inputElement.value);
  }

  prenotaLezione(nomeDocente: string): void {
    alert(`Prenotazione avviata con ${nomeDocente}`);
  }

  // Metodo helper interno per la lettura dei docenti filtrati
  private listaDocents() {
    return this.listaDocenti();
  }
}