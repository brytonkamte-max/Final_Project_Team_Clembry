import { Component } from '@angular/core';
import { Hero } from '../hero/hero';

@Component({
  selector: 'app-homepage',
  imports: [Hero, ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {
  // proprietà per gestire eventuali pulsanti o messaggi
  titolo: string = 'Trova il docente per le tue ripetizioni online';
  sottotitolo: string =
    'Prenota lezioni individuali o di gruppo, accedi ai materiali e monitora i tuoi progressi.';

  // metodo per pulsante (esempio)
  cercaDocente() {
    alert('Funzione di ricerca docente');
  }
}
