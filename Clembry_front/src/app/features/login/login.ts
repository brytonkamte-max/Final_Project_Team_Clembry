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
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
    isTeacher: new FormControl<boolean>(false, Validators.required),
  });

  onLogin(): void {
    if (!this.loginForm.valid) {
      return;
    }
    const datiLogin = this.loginForm.getRawValue();
    if (datiLogin.isTeacher) {
      this.authServ.login('teacher', datiLogin.username, datiLogin.password);
      console.log('login effettuato per', datiLogin.username, 'ruolo: ', datiLogin.role);
      this.router.navigateByUrl('/teacherPersonalArea');
      return;
    } else {
      this.authServ.login('user', datiLogin.username, datiLogin.password);
      console.log('login effettuato per', datiLogin.username, 'ruolo: ', datiLogin.role);
      this.router.navigateByUrl('/personalArea');
      return;
    }
  }
}
