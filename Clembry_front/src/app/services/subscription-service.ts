import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

export interface Subscription {
  userId: number;
  courseId: number;
  subscriptionData: string;
  courseTitle: string;
  courseMateria: string;
  courseDataOra: string;
  courseImmagine: string;
  teacherNome: string;
  teacherCognome: string;
  studentNome: string;
  studentCognome: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  // Endpoint base del backend
  private readonly apiUrl = 'http://localhost:8080/api/subscriptions';

  // HttpClient
  private http = inject(HttpClient);

  // Stato privato
  private iscrizioniState = signal<Subscription[]>([]);

  // Signal in sola lettura esposto ai componenti
  readonly iscrizioni = this.iscrizioniState.asReadonly();

  constructor() {}

  /**
   * Carica le iscrizioni dell'utente dal database
   */
  // subscription-service.ts
  caricaIscrizioni(userId: number) {
    // Rimuovi .subscribe(...) e metti 'return'
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Restituisce una Signal che contiene tutte le iscrizioni
   */
  getIscrizioni() {
    return this.iscrizioni;
  }

  /**
   * Verifica se l'utente è iscritto ad un corso
   */
  isSubscribed(courseId: number): boolean {
    return this.iscrizioni().some((subscription) => subscription.courseId === courseId);
  }

  /**
   * Aggiunge localmente una nuova iscrizione
   * (puoi collegarlo successivamente ad una POST sul backend)
   */
  addSubscription(subscription: Subscription): void {
    this.iscrizioniState.update((subscriptions) => [...subscriptions, subscription]);
  }

  /**
   * Rimuove localmente un'iscrizione
   * (puoi collegarlo successivamente ad una DELETE sul backend)
   */
  removeSubscription(courseId: number): void {
    this.iscrizioniState.update((subscriptions) =>
      subscriptions.filter((subscription) => subscription.courseId !== courseId),
    );
  }
}
