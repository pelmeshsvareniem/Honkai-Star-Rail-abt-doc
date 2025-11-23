import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/users.model';
import { Character } from '../models/character.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}


  // numai get pentru useri din adminka
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // tipa personaje parca tot din cerinte 
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
} 