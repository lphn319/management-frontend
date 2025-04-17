import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true, // Thêm standalone: true
  imports: [
    CommonModule  // Thêm CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Nội dung component
  ngOnInit() {
    console.log('HomeComponent initialized');
  }
}