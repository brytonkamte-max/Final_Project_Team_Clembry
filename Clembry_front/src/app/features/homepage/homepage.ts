import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Hero } from '../hero/hero';
import { Services } from '../services/services';


@Component({
  selector: 'app-homepage',
  imports: [Navbar,Footer,Hero,Services],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {}
