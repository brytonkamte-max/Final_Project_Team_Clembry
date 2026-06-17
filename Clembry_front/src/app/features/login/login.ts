import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authServ: Auth = inject(Auth);
  private router: Router = inject(Router);

  loginForm: FormGroup = new FormGroup({
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', Validators.required),
    isTeacher: new FormControl<boolean>(false),
  });

  onLogin(): void {
    if (!this.loginForm.valid) {
      return;
    }

    const { username, password, isTeacher } = this.loginForm.getRawValue();

    // Determina il ruolo in base al checkbox (se è quello che usi)
    const role: 'teacher' | 'user' = isTeacher ? 'teacher' : 'user';

    const loginSuccess = this.authServ.login(role, username, password);

    if (!loginSuccess) {
      console.log('Login fallito');
      this.loginForm.reset();
      alert('Utente non registrato o credenziali errate');
      return;
    }

    // Se siamo qui, il login è riuscito
    const targetRoute = role === 'teacher' ? '/teacherPersonalArea' : '/personalArea';
    this.router.navigateByUrl(targetRoute);
  }
}
