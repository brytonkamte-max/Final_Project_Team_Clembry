import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

export interface Subscription {
  user_id: number;
  course_id: number;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = 'http://localhost:8080/api/subscriptions';
  private http = inject(HttpClient);

  private iscrizioniState = signal<Subscription[]>([]);

  constructor() {
    this.caricaIscrizioni();
  }


  get iscrizioni() {
    return this.iscrizioniState.asReadonly();
  }

  caricaIscrizioni(): void {
    this.http.get<Subscription[]>(this.apiUrl).subscribe({
      next: (data: Subscription[]) => this.iscrizioniState.set(data),
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Errore sconosciuto';
        console.error('Errore nel caricamento delle iscrizioni:', message);
      }
    });
  }

  caricaIscrizioniUser(userId: number): void {
  this.http.get<Subscription[]>(
    `${this.apiUrl}/${userId}`
  ).subscribe({
    next: data => this.iscrizioniState.set(data),
    error: err => console.error(err)
  });
}


  /**
   * Verifica se l'utente è iscritto guardando lo stato locale (Signal).
   * È sincrono, reattivo e non fa chiamate inutili al server.
   */
  isSubscribed(courseId: number, userId: number): boolean {
    return this.iscrizioni().some(sub => sub.course_id === courseId && sub.user_id === userId);
  }

  addSubscription(sub: Subscription): void {
    this.http.post<Subscription>(this.apiUrl, sub).subscribe({
      next: () => {
        // Ricarichiamo le iscrizioni per mantenere lo stato locale allineato col DB
        this.caricaIscrizioniUser(sub.user_id);
      },
      error: (err) => console.error('Errore nell\'aggiunta dell\'iscrizione:', err)
    });
  }


deleteSubscription(userId: number, courseId: number): void {
  // Assicurati che l'ordine nell'URL corrisponda a quello del tuo controller Express
  this.http.delete<void>(`${this.apiUrl}/${userId}/${courseId}`).subscribe({
    next: () => {
      // Ricarichiamo le iscrizioni per aggiornare il segnale
      this.caricaIscrizioniUser(userId);
    },
    error: (err) => console.error('Errore nella cancellazione:', err)
  });
}
}
