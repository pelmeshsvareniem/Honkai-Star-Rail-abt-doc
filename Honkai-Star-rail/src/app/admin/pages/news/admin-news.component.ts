import { Component, OnInit, inject, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, WarpBanner, BannerDetail } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news.html',
  styleUrls: ['./news.css']
})
export class AdminNews implements OnInit {
  private adminService = inject(AdminService);

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;

  banners: WarpBanner[] = [];

  newBanner: {
    version: string;
    status: string;
    phase: string;
    dates: string;
    banner_details: BannerDetail[];
  } = {
    version: '',
    status: 'Upcoming',
    phase: 'Phase 1',
    dates: '',
    banner_details: []
  };

  characterFiles: (File | null)[] = [];

  ngOnInit() {
    this.loadBanners();
    this.addCharacterSlot();
  }

  loadBanners() {
    this.adminService.getWarpBanners().subscribe({
      next: (data) => this.banners = data,
      error: (err) => console.error('Error loading banners', err)
    });
  }

  addCharacterSlot() {
    this.newBanner.banner_details.push({ name: '', specs: '', image_path: '' });
    this.characterFiles.push(null);
  }

  removeCharacterSlot(index: number) {
    if (this.newBanner.banner_details.length > 1) {
      this.newBanner.banner_details.splice(index, 1);
      this.characterFiles.splice(index, 1);
    }
  }

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    this.characterFiles[index] = input.files?.[0] || null;
  }

  submitBanner() {
    if (!this.newBanner.version || !this.newBanner.dates) {
      alert('Please fill in Version and Dates');
      return;
    }

    const formData = new FormData();
    formData.append('version', this.newBanner.version);
    formData.append('status', this.newBanner.status);
    formData.append('phase', this.newBanner.phase);
    formData.append('dates', this.newBanner.dates);

    // Important: send bannerDetailsJson to match backend
    formData.append('bannerDetailsJson', JSON.stringify(this.newBanner.banner_details));

    this.characterFiles.forEach((file, index) => {
      if (file) {
        formData.append(`charImage_${index}`, file, file.name);
      }
    });

    this.adminService.addWarpBanner(formData).subscribe({
      next: () => {
        alert('Schedule added successfully!');
        this.loadBanners();
        this.resetForm();
      },
      error: (err) => {
        console.error('Add banner error:', err);
        alert('Failed to add schedule. Make sure all fields are filled and images are valid.');
      }
    });
  }

  deleteBanner(id: number) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.adminService.deleteWarpBanner(id).subscribe({
        next: () => this.banners = this.banners.filter(b => b.id !== id),
        error: (err) => alert('Error deleting banner')
      });
    }
  }

  resetForm() {
    this.newBanner = { version: '', status: 'Upcoming', phase: 'Phase 1', dates: '', banner_details: [] };
    this.characterFiles = [];
    this.addCharacterSlot();
  }

  // Optional helper to display file names
  getFileName(index: number) {
    return this.characterFiles[index]?.name || 'No file selected';
  }

  triggerFileInput(index: number) {
  const fileInput = this.fileInputs.toArray()[index];
  if (fileInput) {
    fileInput.nativeElement.click();
  }
}

}
