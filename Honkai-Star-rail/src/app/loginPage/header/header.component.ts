import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [RouterLink, CommonModule]
})
export class HeaderComponent {
  isLogged = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.isLoggedIn$.subscribe(status => {
      this.isLogged = status;
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.auth.logout();
  }
}
