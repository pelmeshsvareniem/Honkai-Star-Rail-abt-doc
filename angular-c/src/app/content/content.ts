import { Component } from '@angular/core';
@Component({
  selector: 'app-content',
  // Assuming content.component.html is in the same folder as content.ts
  templateUrl: './content.component.html',
  // Assuming content.component.css is in the same folder as content.ts
  styleUrls: ['./content.component.css']
})
export class ContentComponent {
  showDetails = false;

  toggle() {
    this.showDetails = !this.showDetails;
  }
}
angular-c\src\app\app.component.html