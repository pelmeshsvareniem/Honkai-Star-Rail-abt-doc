import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './body.html',
  styleUrls: ['./body.css']
})
export class BodyComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {}

  submitRegister() {
    // verificare minimă
    if (!this.name || !this.email || !this.password) {
      this.error = 'All fields are required!';
      this.success = '';
      return;
    }

    this.auth.register({ 
      name: this.name, 
      email: this.email, 
      password: this.password 
    })
    .subscribe({
      next: () => {
        this.success = 'User created successfully! Redirecting to login...';
        this.error = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.error || 'Registration failed!';
        this.success = '';
      }
    });
  }
}
