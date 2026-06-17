import { Injectable, signal } from '@angular/core';

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
  // Signal che contiene la lista globale dei docenti (può arrivare da un'API in futuro)
  private docentiState = signal<Docente[]>([
    {
      id: 1,
      nome: 'Edoardo Deisat',
      titolo: 'Ingegnere del Software & Full-Stack Developer',
      materie: ['Programmazione', 'Database'],
      bio: 'Specializzato in Angular, TypeScript e architetture cloud. Aiuto gli studenti a superare esami universitari.',
      tariffaOraria: 30,
      stelle: 5,
      recensioni: 28,
      avatar: '👨‍💻',
      disponibileOggi: true
    },
    {
      id: 2,
      nome: 'Prof.ssa Elena Bianchi',
      titolo: 'Docente di Ruolo di Matematica e Fisica',
      materie: ['Matematica', 'Scienze'],
      bio: 'Oltre 10 anni di esperienza nelle scuole superiori. Semplifico l\'algebra lineare e l\'analisi matematica.',
      tariffaOraria: 25,
      stelle: 5,
      recensioni: 42,
      avatar: '👩‍🏫',
      disponibileOggi: true
    },
    {
      id: 3,
      nome: 'Sarah Jenkins',
      titolo: 'Insegnante Madrelingua Certificata CELTA',
      materie: ['Lingue straniere'],
      bio: 'Originaria di Londra. Propongo lezioni interattive focalizzate sulla conversazione e sulla preparazione IELTS.',
      tariffaOraria: 28,
      stelle: 4,
      recensioni: 19,
      avatar: '🇬🇧',
      disponibileOggi: false
    }
  ]);

  // Getter pubblico per leggere il Signal dei docenti
  get docenti() {
    return this.docentiState.asReadonly();
  }
}