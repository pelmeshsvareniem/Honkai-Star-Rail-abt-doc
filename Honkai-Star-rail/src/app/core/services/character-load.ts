import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Character } from '../models/model'; 

@Injectable({
  providedIn: 'root'
})
export class CharacterLoad {
  private characters: Character[] = [];
  private readonly url = 'assets/data.json'; 

  constructor(private http: HttpClient) {}

  load(): Observable<Character[]> {
    if (this.characters.length > 0) {
      return of(this.characters); 
    }
    return this.http.get<Character[]>(this.url).pipe(
      tap(data => this.characters = data)
    );
  }

  getCharacters(): Character[] {
    return this.characters;
  }
}
