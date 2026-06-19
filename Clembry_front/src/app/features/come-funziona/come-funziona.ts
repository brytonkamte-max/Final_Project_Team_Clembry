import { Component } from '@angular/core';

@Component({
  selector: 'app-come-funziona',
  imports: [],
  templateUrl: './come-funziona.html',
  styleUrl: './come-funziona.css',
})
export class ComeFunziona {

  // SEZIONE STEP: i 3 passaggi del percorso studente
  // ogni oggetto = un blocco numerato nella step-list

  steps = [
    {
      numero: 1,
      titolo: 'Trova il tuo docente',
      testo: 'Filtra i docenti per materia e disponibilità, e scegli quello più adatto a te.'
    },
    {
      numero: 2,
      titolo: 'Prenota la lezione',
      testo: 'Scegli data e orario direttamente dal calendario del docente.'
    },
    {
      numero: 3,
      titolo: 'Segui il corso',
      testo: 'Partecipa alla lezione online e monitora i tuoi progressi nel tempo.'
    }
  ];

  // SEZIONE FAQ: domande frequenti con accordion
  // "aperta" tiene lo stato di apertura di ogni singola FAQ

  faqs = [
    {
      domanda: 'Come scelgo il docente giusto per me?',
      risposta: 'Puoi filtrare i docenti per materia, disponibilità e valutazioni degli altri studenti, e consultare il loro profilo prima di prenotare.',
      aperta: false
    },
    {
      domanda: 'Cosa succede durante la prima lezione?',
      risposta: 'La prima lezione serve a conoscere il docente e chiarire i tuoi obiettivi. Se non ti convince, puoi sempre scegliere un altro docente.',
      aperta: false
    },
    {
      domanda: 'Come funzionano i pagamenti?',
      risposta: 'Puoi pagare singole lezioni oppure scegliere un pacchetto di ore. Il pagamento avviene direttamente sulla piattaforma in modo sicuro.',
      aperta: false
    },
    {
      domanda: 'Posso disdire o riprogrammare una lezione?',
      risposta: 'Sì, puoi cancellare o spostare una lezione prenotata fino a un certo limite di ore prima, direttamente dal tuo calendario.',
      aperta: false
    }
  ];


  // METODO: apre/chiude una singola FAQ al click
  // riceve l'oggetto faq cliccato e inverte il suo stato
  toggleFaq(faq: { aperta: boolean }) {
    faq.aperta = !faq.aperta;
  }
}
