import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  submitted = false;

  regForm: FormGroup = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    surname: new FormControl<string>('', Validators.required),
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    role: new FormControl<string>('user', Validators.required),
    terms: new FormControl<boolean>(false, Validators.requiredTrue),
  });

  onSubmit(): void {
    if (!this.regForm.valid) {
      this.submitted = true;
      console.log('Dati inviati:', this.regForm.value);
    }
  }
}
