import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CharacterLoad } from '../../core/services/character-load';
import { Character } from '../../core/models/model';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './body.html',
  styleUrls: ['./body.css']
})
export class BodyComponent implements OnInit {
  character?: Character;

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterLoad
  ) {}

  ngOnInit(): void {
    // Preluăm ID-ul din ruta curentă
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Încărcăm lista de caractere și găsim caracterul cu ID-ul respectiv
    this.characterService.load().subscribe({
      next: (data) => {
        this.character = data.find((c) => c.id === id);
        if (!this.character) {
          console.warn(`Caracter cu id ${id} nu a fost găsit.`);
        }
      },
      error: (err) => console.error('Eroare la încărcare JSON:', err)
    });
  }
}
