import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterLoad } from '../../core/services/character-load';
import { Character } from '../../core/models/model';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './body.html',
  styleUrls: ['./body.css']
})
export class BodyComponent implements OnInit {
  characters: Character[] = [];

  constructor(private characterService: CharacterLoad) {}

  ngOnInit(): void {
    this.characterService.load().subscribe({
      next: data => {
        this.characters = data;
      },
      error: err => console.error('Eroare la încărcare JSON:', err)
    });
  }
}
