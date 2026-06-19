import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-come-funziona',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './come-funziona.html',
  styleUrl: './come-funziona.css',
})
export class ComeFunziona {
  constructor(private router: Router) {}

  // 1. I 3 PASSAGGI DEL PERCORSO STUDENTE
  steps = [
    {
      numero: '01',
      titolo: 'Trova il tuo docente',
      testo: 'Esplora i profili dei docenti certificati. Filtra per materia, disponibilità oraria e recensioni degli altri studenti per trovare la corrispondenza perfetta.'
    },
    {
      numero: '02',
      prenota: true, // flag per layout o stili dedicati se necessari
      titolo: 'Prenota la lezione',
      testo: 'Seleziona il giorno e l\'ora che preferisci direttamente dal calendario integrato sul profilo del docente. Paga in sicurezza in pochi clic.'
    },
    {
      numero: '03',
      titolo: 'Segui il corso',
      testo: 'Accedi all\'aula virtuale interattiva direttamente dalla piattaforma. Segui le lezioni, condividi materiali e monitora i tuoi progressi.'
    }
  ];

  // 2. SEZIONE VANTAGGI (COMPLETA E STRUTTURATA)
  vantaggi = [
    {
      icon: '📅',
      titolo: 'Calendario Flessibile',
      desc: 'Gestisci le tue lezioni in totale autonomia, ripianificando gli appuntamenti secondo le tue necessità.'
    },
    {
      icon: '📂',
      titolo: 'Materiale Condiviso',
      desc: 'Accedi a dispense, esercizi e registrazioni delle lezioni caricate direttamente dai tuoi docenti.'
    },
    {
      icon: '🔒',
      titolo: 'Pagamenti Protetti',
      desc: 'Transazioni sicure al 100%. Scegli se pagare la singola lezione o risparmiare con i pacchetti ore.'
    }
  ];

  // 3. DOMANDE FREQUENTI (FAQ)
  faqs = [
    {
      domanda: 'Come scelgo il docente giusto per me?',
      risposta: 'Puoi filtrare i docenti per materia, disponibilità e valutazioni degli altri studenti, e consultare il loro profilo dettagliato prima di effettuare qualsiasi prenotazione.',
      aperta: false
    },
    {
      domanda: 'Cosa succede durante la prima lezione?',
      risposta: 'La prima lezione serve a definire gli obiettivi didattici e pianificare il percorso d\'apprendimento. Se il docente non soddisfa le tue aspettative, il nostro team ti aiuterà a trovarne un altro immediatamente.',
      aperta: false
    },
    {
      domanda: 'Come funzionano i pagamenti?',
      risposta: 'Il pagamento avviene direttamente sulla piattaforma tramite metodi sicuri e crittografati (Carta di Credito, PayPal). I fondi vengono trasferiti al docente solo a lezione completata.',
      aperta: false
    },
    {
      domanda: 'Posso disdire o riprogrammare una lezione?',
      risposta: 'Sì, puoi annullare o spostare una lezione senza alcuna penale fino a 24 ore prima dell\'inizio del collegamento, gestendo tutto direttamente dalla tua dashboard personale.',
      aperta: false
    }
  ];

  // METODO: Gestisce l'apertura a scatto alternato/singolo delle FAQ
  toggleFaq(faq: any) {
    faq.aperta = !faq.aperta;
  }

  // NAVIGAZIONE
  vaiADocenti() {
    this.router.navigate(['/teachers']);
  }
}