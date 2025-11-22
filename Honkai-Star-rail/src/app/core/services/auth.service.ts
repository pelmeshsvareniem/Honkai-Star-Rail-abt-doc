import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:3000';
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  private userRole = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRole.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (token) this.loggedIn.next(true);
      if (role) this.userRole.next(role);
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap((res: any) => this.saveToken(res.token, res.user.role)));
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  saveToken(token: string, role?: string) {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('token', token);
      if (role) {
        localStorage.setItem('role', role);
        this.userRole.next(role);
      }
      this.loggedIn.next(true);
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      this.loggedIn.next(false);
      this.userRole.next(null);
      this.router.navigate(['/login']);
    }
  }

  getRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('role');
  }

  hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }
}
