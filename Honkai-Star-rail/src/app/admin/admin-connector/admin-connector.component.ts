import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/admin-header.component';

@Component({
  selector: 'app-admin-connector',
  template: `
    <div class="container-fluid vh-100">
      <div class="row h-100">
        <!-- Sidebar -->
        <div class="col-3 bg-light border-end p-0">
          <app-header class="h-100 d-flex flex-column"></app-header>
        </div>

        <!-- Main content -->
        <div class="col-9 d-flex flex-column">
          <div class="flex-grow-1 overflow-auto p-3">
            <router-outlet></router-outlet>
          </div>

        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [RouterModule, HeaderComponent ]
})
export class AdminConnectorComponent {}
