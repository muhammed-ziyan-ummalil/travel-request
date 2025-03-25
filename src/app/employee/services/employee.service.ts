import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://127.0.0.1:8000/employee/'; // Base URL
  private loginUrl = 'http://127.0.0.1:8000/userlogin/'; // Login URL
  private TOKEN_KEY = 'auth_token'; //  Use correct key for token

  constructor(private http: HttpClient) {}

  //  Get token dynamically from localStorage
  private getHeaders() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return {
      headers: new HttpHeaders({
        Authorization: `Token ${token}`
      })
    };
  }

  //  Login method to authenticate user and store token
  login(username: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, {
      username: username,
      password: password
    });
  }

  //  Store token and other details after successful login
  storeUserData(token: string, role: string, managerId: number | null) {
    localStorage.setItem(this.TOKEN_KEY, token); //  Correct key for storing token
    localStorage.setItem('role', role);
    if (managerId !== null) {
      localStorage.setItem('manager_id', managerId.toString());
    }
  }

  //  Get employee data dynamically
  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}dashboard/`, this.getHeaders());
  }

  //  Cancel a travel request
  cancelTravelRequest(requestId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}cancel-request/${requestId}/`,
      {},
      this.getHeaders()
    );
  }

  //  Logout and clear localStorage
  logout() {
    localStorage.removeItem(this.TOKEN_KEY); //  Correct key removal
    localStorage.removeItem('role');
    localStorage.removeItem('manager_id');
  }

  //  Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY); //  Correct key check
  }
}
