import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import { User } from '../models/users.model';
import { Character } from '../models/character.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000';
  private isBrowser: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }


  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  getCurrentUserName(): string {
    return this.getCurrentUser()?.name || 'Guest';
  }


  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

 
  getCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(`${this.apiUrl}/api/characters`);
  }

  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/api/characters/${id}`);
  }

  addCharacter(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/characters`, formData);
  }

  updateCharacter(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/characters/${id}`, formData);
  }

  removeCharacter(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/characters/${id}`);
  }


  getCommentsByCharacter(characterId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/comments/${characterId}`);
  }

  addComment(data: { characterId: number; text: string; userName?: string }): Observable<any> {
  const user = this.getCurrentUser();
  
  console.log('Service - Current user:', user);
  console.log('Service - Provided userName:', data.userName);
  
  const payload = {
    userId: user?.id || null,
    userName: user?.name || data.userName || 'Guest',
    characterId: data.characterId,
    text: data.text
  };
  
  console.log('Service - Final payload:', payload);
  return this.http.post(`${this.apiUrl}/api/comments`, payload);
}
}