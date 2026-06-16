import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-courses',
  imports: [RouterOutlet],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {}
