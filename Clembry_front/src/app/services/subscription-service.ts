import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

export interface Subscription {
  userId: number;
  courseId: number;
  subscriptionData: string;
  titolo: string;
  materia: string;
  dataOra: string;
  immagine: string;
  teacherNome: string;
  teacherCognome: string;
  studentNome: string;
  studentCognome: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = 'http://localhost:8080/api/subscriptions';
  private http = inject(HttpClient);

  private iscrizioniState = signal<Subscription[]>([]);
  readonly iscrizioni = this.iscrizioniState.asReadonly();

  caricaIscrizioni(userId: number): void {
    this.http.get<Subscription[]>(`${this.apiUrl}/${userId}`).subscribe({
      next: (data: Subscription[]) => this.iscrizioniState.set(data),
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Errore sconosciuto';
        console.error('Errore nel caricamento delle iscrizioni:', message);
      }
    });
  }

  /**
   * Verifica se l'utente è iscritto guardando lo stato locale (Signal).
   * È sincrono, reattivo e non fa chiamate inutili al server.
   */
  isSubscribed(courseId: number, userId: number): boolean {
    return this.iscrizioni().some(sub => sub.courseId === courseId && sub.userId === userId);
  }

  addSubscription(sub: Subscription): void {
    this.http.post<Subscription>(this.apiUrl, sub).subscribe({
      next: () => {
        // Ricarichiamo le iscrizioni per mantenere lo stato locale allineato col DB
        this.caricaIscrizioni(sub.userId);
      },
      error: (err) => console.error('Errore nell\'aggiunta dell\'iscrizione:', err)
    });
  }
}
