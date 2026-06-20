import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CoursesService } from '../../services/courses-service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit, OnDestroy {
  private router = inject(Router);
  private coursesService = inject(CoursesService);

  // Lettura del Signal originale dal Service
  private corsiDalServer = this.coursesService.corsi;

  /* NUOVO REPARTO SICUREZZA:
     Se il server risponde con una lista vuota, questo computed genera al volo
     i corsi finti per non lasciare la vetrina della Home vuota!
  */
  corsiSignal = computed(() => {
    const datiReali = this.corsiDalServer();

    if (datiReali && datiReali.length > 0) {
      return datiReali; // Mostra i dati del database se presenti
    }

    // Dati simulati di backup se il backend è vuoto o spento
    return [
      { id: 1, titolo: 'Matematica Finanziaria e Algebra Lineare', docente: 'Prof.ssa Elena Bianchi', prezzo: 25.00, materia: 'Matematica' },
      { id: 2, titolo: 'Introduzione ad Angular e TypeScript', docente: 'Ing. Mario Rossi', prezzo: 30.00, materia: 'Programmazione' },
      { id: 3, titolo: 'Fisica Quantistica e Meccanica', docente: 'Prof.ssa Elena Bianchi', prezzo: 25.00, materia: 'Fisica' }
    ];
  });

  slides = [
    {
      image: 'img/img1.jpg',
      title: 'Studio Online',
      description: 'Impara dove e quando vuoi con i nostri docenti certificati.'
    },
    {
      image: 'img/img2.jpg',
      title: 'Materiale Didattico',
      description: 'Accedi a migliaia di risorse e documenti condivisi.'
    },
    {
      image: 'img/img3.jpg',
      title: 'Progressi Monitorati',
      description: 'Visualizza i tuoi risultati e ricevi feedback costanti.'
    }
  ];

  currentSlide = 0;
  private autoPlayInterval: any;

  // Portato a 5000ms (5 secondi) per una lettura ottimale e rilassante delle slide
  private readonly AUTOPLAY_MS = 5000;

  titolo: string = 'Trova il docente per le tue ripetizioni online';
  sottotitolo: string = 'Prenota lezioni individuali o di gruppo, accedi ai materiali e monitora i tuoi progressi.';

  passaggi = [
    { icon: '🔍', titolo: '1. Cerca il Docente', desc: 'Filtra per materia, disponibilità e recensioni.' },
    { icon: '📅', titolo: '2. Prenota la Lezione', desc: 'Scegli l\'orario perfetto direttamente dal calendario.' },
    { icon: '💻', titolo: '3. Accedi all\'Aula', desc: 'Segui la lezione online nella nostra aula virtuale interattiva.' }
  ];

  ngOnInit() {
    this.startAutoPlay();
    this.coursesService.caricaCorsiDati();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  vaiACorsi() {
    this.router.navigate(['/courses']);
  }

  vaiADocenti() {
    this.router.navigate(['/teachers']);
  }

  vaiADettaglioCorso(idCorso: number) {
    this.router.navigate(['/courses']);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  // Permette di selezionare una slide specifica resettando in modo sicuro il timer da zero
  setSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay(); // Evita la sovrapposizione di timer multipli
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.AUTOPLAY_MS);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}
