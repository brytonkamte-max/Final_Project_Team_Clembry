import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Hero } from '../hero/hero';
import { Services } from '../services/services';
import { Courses } from "../courses/courses";


@Component({
  selector: 'app-homepage',
  imports: [  Hero, Services],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {}
