import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  templateUrl: './role-selection.component.html',
  styleUrls: ['./role-selection.component.css'],
})
export class RoleSelectionComponent {
  constructor(private router: Router) {}

  selectRole(role: string) {
    console.log(`Selected role: ${role}`); 
    localStorage.setItem('selected_role', role); 

    // Navigate to the appropriate login page
    switch (role) {
      case 'employee':
        this.router.navigate(['/employee/login']);
        break;
      case 'manager':
        this.router.navigate(['/manager/login']);
        break;
      case 'admin':
        this.router.navigate(['/admin/login']);
        break;
      default:
        console.error('Invalid role selected');
    }
  }
}
