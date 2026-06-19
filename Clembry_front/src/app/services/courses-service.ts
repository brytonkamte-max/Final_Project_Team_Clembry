import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface Corso {
  id: number;
  titolo: string;
  descrizione: string;
  docente: string;
  materia: string;
  prezzo: number;
  dataOra: string;
  stelle: number;
  immagine: string;
  teacher_id?: number; 
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly apiUrl = 'http://localhost:8080/api/courses'; 
  private http = inject(HttpClient);
  private corsiState = signal<Corso[]>([]);

  constructor() {
    this.caricaCorsiDati();
  }

  get corsi() {
    return this.corsiState.asReadonly();
  }

  /**
   * Reso pubblico (era private) per poter forzare il refresh dell'elenco dal componente
   */
  caricaCorsiDati(): void {
    this.http.get<Corso[]>(this.apiUrl).subscribe({
      next: (datiDalDb) => {
        this.corsiState.set(datiDalDb);
      },
      error: (errore) => console.error('Impossibile recuperare i corsi dal database:', errore)
    });
  }

  /**
   * NUOVO: Crea un nuovo corso sul database e aggiorna la lista locale
   */
  aggiungiNuovoCorso(nuovoCorso: any): Observable<any> {
    return this.http.post(this.apiUrl, nuovoCorso).pipe(
      tap(() => {
        // Ricarica la lista aggiornata dal database per tirare giù anche il CONCAT del nome docente fuso da SQL
        this.caricaCorsiDati();
      })
    );
  }
}