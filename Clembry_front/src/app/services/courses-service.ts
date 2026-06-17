import { Injectable, signal } from '@angular/core';

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
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private corsiState = signal<Corso[]>([
    {
      id: 1,
      titolo: 'Sviluppo Web Moderno con Angular',
      descrizione: 'Impara a creare applicazioni web scalabili usando i Signals, le Standalone Component e le Guard di sicurezza.',
      docente: 'Edoardo Deisat',
      materia: 'Programmazione',
      prezzo: 49,
      dataOra: '22 Giugno 2026 - ore 18:30',
      stelle: 5,
      immagine: '👨‍💻'
    },
    {
      id: 2,
      titolo: 'Matematica Finanziaria e Algebra Lineare',
      descrizione: 'Ripasso intensivo pre-esame sulle matrici, calcolo vettoriale e modelli di ottimizzazione per l\'economia.',
      docente: 'Prof. Mario Rossi',
      materia: 'Matematica',
      prezzo: 25,
      dataOra: '24 Giugno 2026 - ore 15:00',
      stelle: 4,
      immagine: '📐'
    },
    {
      id: 3,
      titolo: 'Inglese B2 per Sviluppatori Software',
      descrizione: 'Migliora la tua fluidità nei colloqui tecnici, nella scrittura della documentazione e nella comunicazione in team internazionali.',
      docente: 'Sarah Jenkins',
      materia: 'Lingue',
      prezzo: 35,
      dataOra: '29 Giugno 2026 - ore 19:00',
      stelle: 5,
      immagine: '🇬🇧'
    },
    {
      id: 4,
      titolo: 'Database Relazionali e Ottimizzazione SQL',
      descrizione: 'Scopri come progettare schemi di database robusti e ottimizzare query complesse senza far crashare il server.',
      docente: 'Edoardo Deisat',
      materia: 'Programmazione',
      prezzo: 40,
      dataOra: '02 Luglio 2026 - ore 17:00',
      stelle: 4,
      immagine: '🗄️'
    }
  ]);

  get corsi() {
    return this.corsiState.asReadonly();
  }
}