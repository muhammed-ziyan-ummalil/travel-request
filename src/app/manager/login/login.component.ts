import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manager-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class ManagerLoginComponent {
  email = ''; // Email bound to input
  password = ''; // Password bound to input
  role = 'manager'; // Fixed role as manager
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  //  Submit Manager Login
  onSubmit() {
    const loginData = {
      email: this.email, // Use email as username
      password: this.password,
      role: this.role, // Fixed role for manager login
    };

    //  Send login request to backend
    this.http.post<any>('http://127.0.0.1:8000/userlogin/', loginData).subscribe({
      next: (response) => {
        //  Store token and role in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_role', response.role);

        // Store manager-specific info if needed
        if (response.role === 'manager' && response.manager_id != null) {
          localStorage.setItem('manager_id', String(response.manager_id)); // ✅ Safely convert to string
          if (response.manager_name) {
            localStorage.setItem('manager_name', response.manager_name);
          }
        } else {
          localStorage.removeItem('manager_id');
          localStorage.removeItem('manager_name');
        }        

          // Redirect manager to the dashboard
        if (response.role === 'manager') {
          this.router.navigate(['/manager/dashboard']);
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
