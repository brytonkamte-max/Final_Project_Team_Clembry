import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MembroTeam {
  id: number;
  nome: string;
  ruolo: string;
  laurea: string;
  avatar: string;
  competenze: { web: string; strumenti: string };
  recapiti: { tel: string; email: string; linkedin: string; github: string };
  bio?: string;
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts-component.html',
  styleUrl: './contacts-component.css'
})
export class ContactsComponent {
  // Signal con la lista dei membri del team ricavati dai tuoi file HTML
team = signal<MembroTeam[]>([
  {
    id: 1,
    nome: 'Bryton Junior Kengne Kamte',
    ruolo: 'Junior Software Developer',
    laurea: '🎓 Laureato in Ingegneria delle Reti e Telecomunicazioni',
    /* Cartoon: Ragazzo con carnagione scura, capelli corti ricci e occhiali su sfondo circolare */
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bryton&backgroundColor=c0aede', 
    competenze: { web: 'HTML, CSS, JavaScript', strumenti: 'SQL, Git' },
    recapiti: {
      tel: '+39 3514312103',
      email: 'brytonkamte@gmail.com',
      linkedin: 'https://www.linkedin.com/in/bryton-junior-kengne-kamte-5422ab281',
      github: 'https://github.com/brytonkamte-max'
    }
  },
  {
    id: 2,
    nome: 'Claudio Esposito',
    ruolo: 'Junior Software Developer',
    laurea: '🎓 Laureato in Informatica',
    /* Cartoon: Ragazzo biondo con maglietta e stile piatto moderno su sfondo colorato */
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Bryton&face=smile,serious&body=chest',
    competenze: { web: 'HTML, CSS, JavaScript', strumenti: 'SQL, Git' },
    recapiti: {
      tel: '+39 123456789',
      email: 'claudio.esposito@gmail.com',
      linkedin: 'https://www.linkedin.com/in/claudio-esposito-5422ab281',
      github: 'https://github.com/claudio-max'
    },
  },
  {
    id: 3,
    nome: 'Emanuele Zeppa',
    ruolo: 'Junior Software Developer',
    laurea: '🎓 Laureato in Sociologia Digitale e Analisi del Web',
    /* Cartoon: Ragazzo castano con felpa con cappuccio in perfetto stile informatico */
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emanuele&topType=shortHair&clotheType=Hoodie',
    competenze: { web: 'HTML, CSS, JavaScript', strumenti: 'SQL, Git' },
    recapiti: {
      tel: '+39 123456789',
      email: 'emanuelezeppa@gmail.com',
      linkedin: 'https://www.linkedin.com/in/emanuele-zeppa-5422ab281',
      github: 'https://github.com/emanuelezeppa-max'
    }
  }
]);


}