import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Character } from '../../core/models/character.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-body',
  templateUrl: './body.html',
  styleUrls: ['./body.css'], 
  imports: [ CommonModule, FormsModule ],
})
export class BodyComponent implements OnInit {
  character?: Character;
  comments: any[] = [];
  newComment: string = '';
  userName: string = '';
  backendUrl = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

 ngOnInit(): void {
  // Add this to check if user is logged in
  console.log('Current user:', this.adminService.getCurrentUser());
  
  this.route.params.subscribe(params => {
    const id = Number(params['id']);
    if (!id) return;

    this.adminService.getCharacterById(id).subscribe({
      next: (data) => {
        this.character = data;
        this.loadComments();
      },
      error: () => this.character = undefined
    });
  });
}

  loadComments(): void {
    if (!this.character) return;

    this.adminService.getCommentsByCharacter(this.character.id!).subscribe({
      next: (data) => this.comments = data,
      error: (err) => console.error(err)
    });
  }

  postComment(): void {
  if (!this.newComment.trim() || !this.character) return;

  // Add this to see what's being sent
  console.log('Posting comment with userName:', this.userName);
  console.log('Current logged-in user:', this.adminService.getCurrentUser());

  this.adminService.addComment({
    characterId: this.character.id!,
    text: this.newComment,
    userName: this.userName.trim() || undefined
  }).subscribe({
    next: () => {
      this.newComment = '';
      this.userName = '';
      this.loadComments();
    },
    error: (err) => console.error(err)
  });
}


}
