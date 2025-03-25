import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = ''; 
  password = '';
  role = ''; 
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  // onSubmit() to handle form submission
  onSubmit() {
    const loginData = {
      email: this.email, // Use email as username
      password: this.password,
      role: this.role || 'employee', // Default role if not dynamically selected
    };

    // Send login request to backend
    this.http.post<any>('http://127.0.0.1:8000/userlogin/', loginData).subscribe({
      next: (response) => {
        // Store token and role in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_role', response.role);

        if (response.role === 'employee' && response.manager_id !== null) {
          localStorage.setItem('manager_id', response.manager_id.toString());
          if (response.manager_name) {
            localStorage.setItem('manager_name', response.manager_name); 
          }
        } else {
          localStorage.removeItem('manager_id');
          localStorage.removeItem('manager_name');
        }

        // Redirect based on role
        if (response.role === 'employee') {
          this.router.navigate(['/employee/dashboard']);
        }
            },
            error: (error) => {
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
  logout(){
    localStorage.removeItem('auth_token');
  }
}
