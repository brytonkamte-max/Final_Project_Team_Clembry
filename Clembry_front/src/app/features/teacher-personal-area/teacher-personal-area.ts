import { Component as AngularComponent, computed, inject, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth-service';
import { TeacherService } from '../../services/teacher-service';
import { CoursesService } from '../../services/courses-service';

@AngularComponent({
  selector: 'app-teacher-personal-area',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './teacher-personal-area.html',
  styleUrl: './teacher-personal-area.css',
})
export class TeacherPersonalArea implements OnInit {
  authService = inject(Auth);
  teacherService = inject(TeacherService);
  coursesService = inject(CoursesService);
  router = inject(Router);

  // Stati per la gestione della UI
  isCreatingCourse = false;
  isEditingBio = false;
  courseCreatedSuccess = false;

  // Variabili temporanee per i selettori nativi di data e ora
  tempData = '';
  tempOra = '';

  // Modelli locali agganciati ai form con [(ngModel)]
  editBioPayload = { bio: '', titolo: '' };
  newCoursePayload = { titolo: '', descrizione: '', materia: '', prezzo: 0, dataOra: '' };

  // 1. Recupero del docente connesso dal Signal
  currentTeacher = computed(() => {
    const userLoggato = this.authService.getCurrentUser();
    if (!userLoggato) return null;
    return this.teacherService.docenti().find(t => t.email === userLoggato.email) || null;
  });

  // 2. Filtro dei corsi del docente connesso
  myCourses = computed(() => {
    const docente = this.currentTeacher();
    if (!docente) return [];
    
    const nomeCompleto = `${this.authService.getCurrentUser()?.nome} ${this.authService.getCurrentUser()?.cognome}`;
    return this.coursesService.corsi().filter(c => c.docente === nomeCompleto);
  });

  constructor() {
    effect(() => {
      const docenteInfo = this.currentTeacher();
      if (docenteInfo && !this.isEditingBio) {
        this.editBioPayload.bio = docenteInfo.bio;
        this.editBioPayload.titolo = docenteInfo.titolo;
      }
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
  }

  saveProfile(): void {
    const docenteId = this.currentTeacher()?.id || this.authService.getCurrentUser()?.id;
    if (!docenteId) return;

    this.teacherService.updateDocente(docenteId, this.editBioPayload).subscribe({
      next: () => {
        this.isEditingBio = false;
        this.teacherService.caricaDocenti();
      },
      error: (err) => console.error('Errore aggiornamento profilo:', err)
    });
  }

  saveCourse(): void {
    const docenteId = this.currentTeacher()?.id || this.authService.getCurrentUser()?.id;
    
    // Validazione silenziosa senza alert nativi: se manca qualcosa, interrompe il click
    if (!this.tempData || !this.tempOra || !this.newCoursePayload.titolo || !docenteId) {
      return;
    }

    // Formattazione data nativa
    const opzioni: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const dataEletta = new Date(this.tempData).toLocaleDateString('it-IT', opzioni);
    const dataFormattata = dataEletta.replace(/^\d+\s+\w/, (match) => match.toUpperCase());

    this.newCoursePayload.dataOra = `${dataFormattata} - ${this.tempOra}`;

    const payloadCompleto = {
      ...this.newCoursePayload,
      teacher_id: docenteId,
      immagine: '📘'
    };

    this.coursesService.aggiungiNuovoCorso(payloadCompleto).subscribe({
      next: () => {
        
        
        // 2. Svuota immediatamente tutti i campi input del form
        this.newCoursePayload = { titolo: '', descrizione: '', materia: '', prezzo: 0, dataOra: '' };
        this.tempData = '';
        this.tempOra = '';
        
        // 1. Attiva subito l'alert verde sotto i bottoni nell'HTML
        this.courseCreatedSuccess = true;
        
        // 3. Mantiene visibile il feedback verde per 3 secondi, poi chiude la tab e refresha
        
          // this.courseCreatedSuccess = false;
          // this.isCreatingCourse = false; 
          // this.coursesService.caricaCorsiDati();
        
      },
      error: (err) => console.error('Errore creazione corso backend:', err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}