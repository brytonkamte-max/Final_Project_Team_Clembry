import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-area',
  imports: [],
  templateUrl: './personal-area.html',
  styleUrl: './personal-area.css',
})
export class PersonalArea {
  username = 'Mario Rossi';
  email = 'hD4fP@example.com';
  courses = [
    { title: 'Matematica', description: 'Descrizione del corso di matematica.' },
    { title: 'Fisica', description: 'Descrizione del corso di fisica.' },
    { title: 'Informatica', description: 'Descrizione del corso di informatica.' },
  ]
  
}
