import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Character } from '../models/model'; // <- adaptează calea modelului tău

@Injectable({
  providedIn: 'root'
})
export class CharacterLoad {
  private characters: Character[] = [];
  private readonly url = 'assets/data.json'; // fișierul tău JSON

  constructor(private http: HttpClient) {}

  // Încarcă personajele o singură dată
  load(): Observable<Character[]> {
    if (this.characters.length > 0) {
      return of(this.characters); // deja încărcate
    }
    return this.http.get<Character[]>(this.url).pipe(
      tap(data => this.characters = data)
    );
  }

  // Returnează personajele stocate local
  getCharacters(): Character[] {
    return this.characters;
  }
}
