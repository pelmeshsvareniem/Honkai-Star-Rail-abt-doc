import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './body.html',
  styleUrls: ['./body.css']
})
export class BodyComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submitLogin() {
  const credentials = {
    email: this.email,
    password: this.password
  };

  // Admin shortcut check
  if (this.email === 'admin' && this.password === 'admin') {
    // optionally save a token for admin
    if (typeof window !== 'undefined') {
      this.auth.saveToken('admin-token'); 
    }
    this.router.navigate(['/admin']); // redirect to admin dashboard
    return;
  }

  // Normal login flow
  this.auth.login(credentials).subscribe({
    next: (res: any) => {
      if (typeof window !== 'undefined' && res.token) {
        this.auth.saveToken(res.token);
        this.router.navigate(['/home']);
      }
    },
    error: (err) => {
      console.error(err);
      this.error = 'Email sau parolă greșită!';
    }
  });
}

}
