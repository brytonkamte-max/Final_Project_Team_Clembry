import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {
  features = [
    {
      icon: '📅',
      title: 'Calendario',
      description: 'Gestisci le lezioni facilmente',
    },
    {
      icon: '📚',
      title: 'Materiale',
      description: 'Archivio documenti',
    },
    {
      icon: '💳',
      title: 'Pagamenti',
      description: 'Gestione sicura',
    },
  ];
}
