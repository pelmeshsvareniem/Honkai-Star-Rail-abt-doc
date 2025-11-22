import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Character } from '../../core/models/character.model';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './body.html',
  styleUrls: ['./body.css']
})
export class BodyComponent implements OnInit {
  character?: Character;
  backendUrl = 'http://localhost:3000'; // base URL for images

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const id = Number(params['id']);
      if (!id) {
        console.error('No character ID provided in route');
        return;
      }

      // Use AdminService to fetch character
      this.adminService.getCharacterById(id).subscribe({
        next: (data) => {
          this.character = data;
        },
        error: (err) => {
          console.error('Error loading character from backend:', err);
          this.character = undefined;
        }
      });
    });
  }
} 