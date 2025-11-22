import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Character } from '../../../core/models/character.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './characters.html',
  styleUrls: ['./characters.css']
})
export class AdminCharacters implements OnInit {

  characters: Character[] = [];

  newCharacter: Partial<Character> & { imageFile?: File } = {
    name: '',
    type: '',
    description: '',
    image: null
  };

  editingCharacter: Partial<Character> & { imageFile?: File } = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters() {
    this.adminService.getCharacters().subscribe({
      next: (data: Character[]) => {
        this.characters = data.map(c => ({
          ...c,
          images: c.image ? [c.image] : []
        }));
      },
      error: (err) => console.error('Error loading characters:', err)
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.newCharacter.imageFile = file;
    }
  }

  addCharacter() {
    if (!this.newCharacter.name || !this.newCharacter.type) return;

    const formData = new FormData();
    formData.append('name', this.newCharacter.name!);
    formData.append('type', this.newCharacter.type!);
    formData.append('description', this.newCharacter.description || '');
    if (this.newCharacter.imageFile) {
      formData.append('image', this.newCharacter.imageFile);
    }

    this.adminService.addCharacter(formData).subscribe({
      next: () => {
        this.loadCharacters();
        this.closeAddModal();
      },
      error: (err) => console.error('Error adding character:', err)
    });
  }

  removeCharacter(id: number) {
    if (!confirm("Are you sure you want to delete this character?")) return;

    this.adminService.removeCharacter(id).subscribe({
      next: () => this.loadCharacters(),
      error: (err) => console.error('Error deleting character:', err)
    });
  }

  openEditModal(character: Character) {
    this.editingCharacter = { ...character };
  }

  onEditFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.editingCharacter.imageFile = file;
    }
  }

 updateCharacter(id: number) {
  if (!this.editingCharacter.name || !this.editingCharacter.type) return;

  const formData = new FormData();
  formData.append('name', this.editingCharacter.name!);
  formData.append('type', this.editingCharacter.type!);
  formData.append('description', this.editingCharacter.description || '');
  if (this.editingCharacter.imageFile) {
    formData.append('image', this.editingCharacter.imageFile);
  }

  this.adminService.updateCharacter(id, formData).subscribe({
    next: () => {
      this.loadCharacters();

      const modalEl = document.getElementById('editCharacterModal' + id);
      if (modalEl) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      this.editingCharacter = {};
    },
    error: (err) => console.error('Error updating character:', err)
  });
}



  closeAddModal() {
    const modal = document.getElementById('addCharacterModal');
    if (modal) (window as any).bootstrap.Modal.getInstance(modal)?.hide();
    this.newCharacter = { name: '', type: '', description: '', image: null };
    this.newCharacter.imageFile = undefined;
  }

  closeEditModal() {
    const modal = document.getElementById('editCharacterModal');
    if (modal) (window as any).bootstrap.Modal.getInstance(modal)?.hide();
    this.editingCharacter = {};
  }


  exportCharactersCSV() {
  if (!this.characters || this.characters.length === 0) return;

  const csvHeader = ['ID', 'Name', 'Description', 'Type', 'Image URL'];
  const csvRows = this.characters.map(c => [
    c.id,
    `"${c.name}"`,
    `"${c.description || ''}"`,
    c.type,
    c.image || ''
  ]);

  const csvContent = [
    csvHeader.join(','),
    ...csvRows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'characters.csv';
  a.click();
  URL.revokeObjectURL(url);
}


}
