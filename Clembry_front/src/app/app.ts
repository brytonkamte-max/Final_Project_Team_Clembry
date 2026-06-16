import { Component, signal } from '@angular/core';
import { Homepage } from './features/homepage/homepage';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Homepage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Clembry_front');
}
