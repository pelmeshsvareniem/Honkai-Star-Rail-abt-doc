import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AdminService, WarpBanner } from '../../core/services/admin.service';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './body.html',
  styleUrls: ['./body.css']
})
export class BodyComponent implements OnInit {
  private adminService = inject(AdminService);
  banners: WarpBanner[] = [];

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.adminService.getWarpBanners().subscribe({
      next: (data) => {
        console.log('Loaded banners:', data);
        this.banners = data;
      },
      error: (err) => console.error('Error loading banners', err)
    });
  }
}
