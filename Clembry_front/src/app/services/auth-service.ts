import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Interfaccia per tipizzare la risposta del server
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

  // Manteniamo i tuoi Signals per gestire lo stato dell'app in tempo reale
  private loggedIn = signal<boolean>(false);
  private role = signal<'teacher' | 'student'>('student');
  private currentUserData = signal<UserResponse | null>(null);

  /**
   * Comunica con il backend Express per autenticare l'utente
   */
  login(credentials: { username: string; password: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: UserResponse) => {
        // Se il server risponde con successo, aggiorniamo i Signals
        this.loggedIn.set(true);
        this.role.set(user.role);
        this.currentUserData.set(user);
        const targetRoute = user.role === 'teacher' ? '/teacherPersonalArea' : '/personalArea';
        this.router.navigateByUrl(targetRoute);
      }),
    );
  }

  // login(credentials: { username: string; password: string }): Observable<UserResponse> {
  //   return this.http.post<UserResponse>(`${this.apiUrl}/login`, credentials).pipe(
  //     tap((user: UserResponse) => {
  //       //
  //       this.updateAuthState(user);
  //       const targetRoute = user.role === 'teacher' ? '/teacherPersonalArea' : '/personalArea';
  //       this.router.navigateByUrl(targetRoute);
  //     })
  //   );
  // }

  /**
   * Registra un nuovo utente nel database remoto
   */
  register(userData: any): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, userData);
  }

  /**
   * Reset dello stato al logout
   */
  logout(): void {
    this.loggedIn.set(false);
    this.role.set('student');
    this.currentUserData.set(null);
    this.router.navigateByUrl('/login');
  }

  // --- I tuoi metodi originari basati su Signal (rimangono invariati per i componenti) ---

  isLoggedIn = this.loggedIn.asReadonly();
  getRole = this.role.asReadonly();
  getCurrentUser = this.currentUserData.asReadonly();
}
