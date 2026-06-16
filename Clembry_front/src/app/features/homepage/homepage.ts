import { Component } from '@angular/core';

@Component({
selector: 'app-homepage', // nome del componente usato nel template
templateUrl: './homepage.html', // collega il file HTML
styleUrls: ['./homepage.css'] // collega il file CSS
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
