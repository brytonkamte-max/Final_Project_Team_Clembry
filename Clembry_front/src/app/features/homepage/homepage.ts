import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Services } from '../services/services';


@Component({
  selector: 'app-homepage',
  imports: [Hero, Services],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {}
