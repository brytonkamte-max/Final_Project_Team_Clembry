import { Component } from '@angular/core';
import { Courses } from '../courses/courses';

@Component({
  selector: 'app-navbar',
  imports: [Courses],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {}
