import { Component } from '@angular/core';
<<<<<<< HEAD
<<<<<<< HEAD
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
=======
>>>>>>> claudio
import { Hero } from '../hero/hero';
import { Services } from '../services/services';

=======
>>>>>>> 177c54319add8659960349ee6141635e91b55c53

@Component({
<<<<<<< HEAD
selector: 'app-homepage', // nome del componente usato nel template
templateUrl: './homepage.html', // collega il file HTML
styleUrls: ['./homepage.css'] // collega il file CSS
=======
  selector: 'app-homepage',
  imports: [Hero, Services],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
>>>>>>> claudio
})
export class Homepage {
// proprietà per gestire eventuali pulsanti o messaggi
titolo: string = 'Trova il docente per le tue ripetizioni online';
sottotitolo: string = 'Prenota lezioni individuali o di gruppo, accedi ai materiali e monitora i tuoi progressi.';

// metodo per pulsante (esempio)
cercaDocente() {
alert('Funzione di ricerca docente');
}
}
