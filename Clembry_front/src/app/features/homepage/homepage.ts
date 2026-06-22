import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CoursesService } from '../../services/courses-service';

interface Slide {
  image: string;
  title: string;
  description: string;
}

interface Passo {
  icon: string;
  titolo: string;
  desc: string;
}

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

  private corsiDalServer = this.coursesService.corsi;

  corsiSignal = computed(() => {
    const datiReali = this.corsiDalServer();
    if (datiReali && datiReali.length > 0) {
      return datiReali;
    }
    return [
      { id: 1, titolo: 'Matematica Finanziaria e Algebra Lineare', docente: 'Prof.ssa Elena Bianchi', prezzo: 25.00, materia: 'Matematica' },
      { id: 2, titolo: 'Introduzione ad Angular e TypeScript', docente: 'Ing. Mario Rossi', prezzo: 30.00, materia: 'Programmazione' },
      { id: 3, titolo: 'Fisica Quantistica e Meccanica', docente: 'Prof.ssa Elena Bianchi', prezzo: 25.00, materia: 'Fisica' }
    ];
  });

  slides: Slide[] = [
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
  private autoPlayInterval: ReturnType<typeof setInterval> | null = null;

  // 6 secondi: tempo comodo per leggere titolo + descrizione prima del cambio slide
  private readonly AUTOPLAY_MS = 3000;

  titolo: string = 'Trova il docente per le tue ripetizioni online';
  sottotitolo: string = 'Prenota lezioni individuali o di gruppo, accedi ai materiali e monitora i tuoi progressi.';

  passaggi: Passo[] = [
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

  // FIX: prima navigava sempre a '/courses', ignorando l'id e portando sempre alla lista.
  // Assunzione: esiste una rotta di dettaglio '/courses/:id' — adatta il path se nel tuo
  // router si chiama diversamente.
  vaiADettaglioCorso(idCorso: number) {
    this.router.navigate(['/courses', idCorso]);
  }

  // --- Carosello ---

  private goToSlide(index: number) {
    const totale = this.slides.length;
    this.currentSlide = ((index % totale) + totale) % totale;
  }

  // Usata dall'autoplay: avanza SENZA riavviare il timer.
  // (prima "nextSlide" veniva chiamata sia dal click che dall'interval, ma solo
  // prevSlide/setSlide resettavano il timer: il prossimo tick poteva scattare
  // quasi subito dopo un click su "avanti". Separando i due casi il comportamento
  // è ora coerente in entrambe le direzioni)
  private advanceSlide() {
    this.goToSlide(this.currentSlide + 1);
  }

  nextSlide() {
    this.advanceSlide();
    this.riavviaTimer();
  }

  prevSlide() {
    this.goToSlide(this.currentSlide - 1);
    this.riavviaTimer();
  }

  setSlide(index: number) {
    this.goToSlide(index);
    this.riavviaTimer();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.advanceSlide(), this.AUTOPLAY_MS);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  // In pausa quando il mouse è sopra il carosello, ripreso quando esce
  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  resumeAutoPlay() {
    this.startAutoPlay();
  }

  private riavviaTimer() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}