import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-courses',
  imports: [Navbar,Footer],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {}
