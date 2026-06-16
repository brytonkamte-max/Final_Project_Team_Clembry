import { Component, signal } from '@angular/core';
import { Homepage } from './features/homepage/homepage';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { Navbar } from "./features/navbar/navbar";
import { Footer } from './features/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar,Footer ,RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Clembry_front');
}
