import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherService } from '../../services/teacher-service';
import { CoursesService } from '../../services/courses-service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css'
})
export class Teachers {
  private teacherService = inject(TeacherService);
  private coursesService = inject(CoursesService);

  // Stato dei filtri (Signals)
  materiaSelezionata = signal<string>('');
  ricercaNome = signal<string>('');

  // Traccia quale singola card è attiva. Gestisce nativamente l'esclusività.
  idDocenteEspanso = signal<number | null>(null);

  listaDocenti = this.teacherService.docenti;

  // Griglia docenti filtrata reattivamente
  docentsFiltrati = computed(() => {
    let docenti = this.listaDocenti();
    const materia = this.materiaSelezionata();
    const nomeCercato = this.ricercaNome().toLowerCase().trim();

    if (materia) {
      docenti = docenti.filter(d => 
        d.materie.some(m => m.toLowerCase() === materia.toLowerCase())
      );
    }

    if (nomeCercato) {
      docenti = docenti.filter(d => 
        d.nome.toLowerCase().includes(nomeCercato) || d.cognome.toLowerCase().includes(nomeCercato)
      );
    }

    return docenti;
  });

  aggiornaFiltro(materia: string): void {
    this.materiaSelezionata.set(materia);
    this.idDocenteEspanso.set(null); // Resetta lo stato di apertura quando cambi categoria
  }

  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.ricercaNome.set(inputElement.value);
  }

  // Cambia lo stato isolato della card: se clicchi un altro docente, il precedente si chiude automaticamente
  toggleCorsiDocente(teacherId: number): void {
    if (this.idDocenteEspanso() === teacherId) {
      this.idDocenteEspanso.set(null);
    } else {
      this.idDocenteEspanso.set(teacherId);
    }
  }

  /**
   * FUNZIONE DI FILTRAGGIO BLINDATA:
   * Isola i corsi confrontando unicamente le chiavi esterne ID (teacher_id) o 
   * accoppiamenti di stringa rigorosi per evitare che corsi di "Mario" appaiano sotto "Elena".
   */
  getCorsiPerDocente(teacherId: number, nomeDocente: string, cognomeDocente: string) {
    const nomeCompletoFiltro = `${nomeDocente} ${cognomeDocente}`.toLowerCase().trim();
    
    return this.coursesService.corsi().filter(corso => {
      const idMatch = (corso as any).teacher_id === teacherId;
      const nomeMatch = corso.docente ? corso.docente.toLowerCase().trim() === nomeCompletoFiltro : false;
      
      return idMatch || nomeMatch;
    });
  }
}