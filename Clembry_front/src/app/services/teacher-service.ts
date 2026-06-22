import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Docente {
  id: number;
  user_id: number;
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
  email?: string;
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

  // Modificato in public per consentire il rinfresco manuale dal componente
  public caricaDocenti(): void {
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
   * Aggiorna i dati del docente sul Backend e sincronizza il Signal dello stato
   */
  updateDocente(id: number, dati: { bio: string; titolo: string }): Observable<any> {
    return this.http.put(`http://localhost:8080/api/teachers/${id}`, dati).pipe(
      tap(() => {
        // Aggiorna lo stato locale del Signal cercando sia per id docente che per user_id
        this.docentiState.update(docenti =>
          docenti.map(d => (d.id === id || d.user_id === id) ? { ...d, ...dati } : d)
        );
      })
    );
  }
}