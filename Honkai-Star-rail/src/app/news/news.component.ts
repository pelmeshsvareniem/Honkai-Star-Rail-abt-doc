import { Component } from '@angular/core';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [],
  templateUrl: './news.html', // ✅ correct relative path
  styleUrls: ['./news.css'] // ✅ correct syntax
})
export class NewsComponent {}
