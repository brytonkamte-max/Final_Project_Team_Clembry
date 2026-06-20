import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Docente {
  id: number;
  nome: string;
  cognome: string;
  titolo: string;
  materie: string[];
  bio: string;
  tariffaOraria: number;
  stelle: number;
  recensioni: number;
  avatar: string;
  disponibileOggi: boolean;
  email?: string; // Opzionale, utile per i confronti
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly apiUrl = 'http://localhost:8080/api/teachers';
  private http = inject(HttpClient);

  private docentiState = signal<Docente[]>([]);

  constructor() {
    this.caricaDocenti();
  }

  get docenti() {
    return this.docentiState.asReadonly();
  }

  private caricaDocenti(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (datiDallApi) => {
        const docentiFormattati: Docente[] = datiDallApi.map(docente => ({
          ...docente,
          disponibileOggi: !!docente.disponibileOggi,
          materie: typeof docente.materie === 'string'
            ? JSON.parse(docente.materie)
            : docente.materie
        }));
        this.docentiState.set(docentiFormattati);
      },
      error: (err) => console.error('Errore nel caricamento dei docenti:', err)
    });
  }

  /**
   * NUOVO: Aggiorna i dati del docente sul Backend e sincronizza il Signal dello stato
   */
  updateDocente(id: number, dati: { bio: string; titolo: string }): Observable<any> {
    return this.http.put(`http://localhost:8080/api/teachers/${id}`, dati).pipe(
      tap(() => {
        // Aggiorna lo stato locale del Signal per riflettere la modifica in tempo reale nell'app
        this.docentiState.update(docenti =>
          docenti.map(d => d.id === id ? { ...d, ...dati } : d)
        );
      })
    );
  }
}
