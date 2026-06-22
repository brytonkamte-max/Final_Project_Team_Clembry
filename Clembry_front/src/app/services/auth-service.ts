import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { Router } from '@angular/router';

export interface UserResponse {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  email: string;
  role: 'student' | 'teacher';
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly apiUrl = 'http://localhost:8080/api/auth';

  // State Management tramite Signals
  private loggedIn = signal<boolean>(false);
  private role = signal<'teacher' | 'student'>('student');
  private currentUserData = signal<UserResponse | null>(null);

  /**
   * Comunica con il backend Express per autenticare l'utente
   */
  login(credentials: { username: string; password: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: UserResponse) => {
        // Aggiorna lo stato reattivo globale dell'applicazione
        this.loggedIn.set(true);
        this.role.set(user.role);
        this.currentUserData.set(user);
        
        // Reindirizza l'utente in base al ruolo restituito dal database
        const targetRoute = user.role === 'teacher' ? '/teacherPersonalArea' : '/personalArea';
        this.router.navigateByUrl(targetRoute);
      }),
    );
  }

  /**
   * Registra un nuovo utente nel database remoto ed esegue il LOGIN AUTOMATICO immediato
   */
  register(userData: any): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, userData).pipe(
      switchMap(() => {
        console.log('Registrazione completata con successo. Avvio il login automatico...');
        // Esegue il login usando i dati appena inseriti dall'utente nel form
        return this.login({
          username: userData.username,
          password: userData.password
        });
      })
    );
  }

  /**
   * Reset dello stato dell'applicazione al logout
   */
  logout(): void {
    this.loggedIn.set(false);
    this.role.set('student');
    this.currentUserData.set(null);
    this.router.navigateByUrl('/login');
  }

  // Esposizione dei Signals in modalità ReadOnly per i componenti della bacheca
  isLoggedIn = this.loggedIn.asReadonly();
  getRole = this.role.asReadonly();
  getCurrentUser = this.currentUserData.asReadonly();
}