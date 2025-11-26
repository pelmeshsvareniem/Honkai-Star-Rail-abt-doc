import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Character } from '../../core/models/character.model';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './body.html',
  styleUrls: ['./body.css']
})
export class BodyComponent implements OnInit {
  characters: Character[] = [];      
  filteredCharacters: Character[] = []; 
  backendUrl = 'http://localhost:3000';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.adminService.getCharacters().subscribe({
      next: (data: Character[]) => {
        this.characters = data.map(c => ({
          ...c,
          image: c.image ? `${this.backendUrl}${c.image}` : ''
        }));
        this.filteredCharacters = [...this.characters];
      },
      error: (err) => console.error('Error loading characters from backend:', err)
    });
  }

  filterCharacters(type: string): void {
    if (type === 'all') {
      this.filteredCharacters = [...this.characters];
    } else {
      this.filteredCharacters = this.characters.filter(c => c.type.toLowerCase() === type.toLowerCase());
    }
  }
}
