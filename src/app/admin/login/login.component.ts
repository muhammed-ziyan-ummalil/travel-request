import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class AdminLoginComponent {
  email = ''; // Admin email bound to input
  password = ''; // Admin password bound to input
  role = 'admin'; // Fixed role for admin login
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  // Submit admin login
  onSubmit() {
    const loginData = {
      email: this.email, // Use email as username
      password: this.password,
      role: this.role, // Fixed role as admin
    };

    // Send login request to backend
    this.http.post<any>('http://127.0.0.1:8000/userlogin/', loginData).subscribe({
      next: (response) => {
        // Store token and role in localStorage
        console.log(response)
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('role', response.role);

        // Store admin-specific info if needed
        if (response.role === 'admin' && response.admin_id !== null) {
          localStorage.setItem('admin_id', response.admin_id.toString());
          if (response.admin_name) {
            localStorage.setItem('admin_name', response.admin_name);
          }
        } else {
          localStorage.removeItem('admin_id');
          localStorage.removeItem('admin_name');
        }

        // Redirect admin to the admin dashboard
        if (response.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (error) => {
        // Handle errors with relevant messages
        if (error.status === 401) {
          this.errorMessage = 'Invalid credentials. Please check your email and password.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please try again later.';
        } else {
          this.errorMessage = error.error?.error || 'An unexpected error occurred during login.';
        }
      },
    });
  }
}
