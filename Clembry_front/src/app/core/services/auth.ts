import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private loggedIn = signal<boolean>(false);
  private role = signal<'teacher' | 'user'>('user');

  private users = [
    {
      username: 'mario',
      password: 'mario',
      role: 'user',
    },
    {
      username: 'claudio',
      password: 'claudio',
      role: 'user',
    },
    {
      username: 'giuseppe',
      password: 'giuseppe',
      role: 'user',
    }
    ,
    {
      username: 'francesco',
      password: 'francesco',
      role: 'user',
    }
  ]

  private teachers = [
    {
      username: 'maria',
      password: 'maria',
      role: 'teacher',
    },
    {
      username: 'francesca',
      password: 'francesca',
      role: 'teacher',
    }
  ]

  login(role: 'teacher' | 'user', username: string, password: string): boolean {
    const list = role === 'teacher' ? this.teachers : this.users;

    // Cerchiamo l'utente nella lista corretta
    const user = list.find(u => u.username === username && u.password === password);

    if (user) {
      this.loggedIn.set(true);
      this.role.set(role);
      return true; // Login riuscito
    }

    return false; // Login fallito
  }

  logout(): void {
    this.loggedIn.set(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  getRole(): 'teacher' | 'user' {
    return this.role();
  }
}
