import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Docente {
  id: number;
  nome: string;
  titolo: string;
  materie: string[];
  bio: string;
  tariffaOraria: number;
  stelle: number;
  recensioni: number;
  avatar: string;
  disponibileOggi: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  // Configurato l'endpoint sulla porta 8080 richiesta
  private readonly apiUrl = 'http://localhost:8080/api/teachers';
  private http = inject(HttpClient);

  // Signal interno per lo stato globale dei docenti
  private docentiState = signal<Docente[]>([]);

  constructor() {
    this.caricaDocenti();
  }

  // Getter pubblico per leggere il Signal in modalità Read-Only
  get docenti() {
    return this.docentiState.asReadonly();
  }

  /**
   * Recupera la lista dei docenti dal backend sulla porta 8080
   */
  private caricaDocenti(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (datiDallApi) => {
        // Sanatizzazione dei dati: se 'materie' arriva dal DB come stringa JSON, la convertiamo in array
        const docentiFormattati: Docente[] = datiDallApi.map(docente => ({
          ...docente,
          // Converte il campo booleano se memorizzato come 1/0 nel DB
          disponibileOggi: !!docente.disponibileOggi,
          // Converte la stringa JSON delle materie in un vero array di stringhe
          materie: typeof docente.materie === 'string' 
            ? JSON.parse(docente.materie) 
            : docente.materie
        }));

        this.docentiState.set(docentiFormattati);
      },
      error: (err) => {
        console.error('Errore nel caricamento dei docenti sulla porta 8080:', err);
      }
    });
  }
}