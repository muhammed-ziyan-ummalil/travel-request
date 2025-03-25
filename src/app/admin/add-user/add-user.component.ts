import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit{
  addUserForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  managers: any[] = []; // Store available managers
  isSubmitting = false;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.addUserForm = this.fb.group({
      user_type: ['manager', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      gender: ['Not Specified'],
      designation: ['HR', Validators.required],
      status: ['active', Validators.required],
      manager: [''],
    });
  }

  ngOnInit(): void {
    this.loadManagers(); // Load manager list when component initializes
    this.onUserTypeChange();
  }

  // Load all available managers
  loadManagers(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    this.http.get('http://127.0.0.1:8000/admin/managers/', { headers }).subscribe({
      next: (data: any) => {
        this.managers = data;
      },
      error: (error) => console.error('Error loading managers:', error),
    });
  }

  // Handle form submission
  submitForm(): void {
    if (this.addUserForm.invalid || this.isSubmitting) return;
  
    this.isSubmitting = true; // ✅ Disable button after first click
    const formData = { ...this.addUserForm.value };
  
    // ✅ Remove manager field if user type is 'manager'
    if (formData.user_type === 'manager') {
      delete formData.manager;
    }
  
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });
  
    this.http.post('http://127.0.0.1:8000/add_user/', formData, { headers }).subscribe({
      next: (response: any) => {
        this.successMessage = response.message;
        this.errorMessage = null;
        this.addUserForm.reset({
          user_type: 'manager',
          status: 'active',
        });
        this.isSubmitting = false; // ✅ Enable button after success
        console.log('Form submitted:', formData);

      },
      error: (error) => {
        this.successMessage = null;
        this.errorMessage = error.error?.error || 'An unexpected error occurred.';
        this.isSubmitting = false; // ✅ Enable button after error
      },
    });
  }
  

  // Listen for user type change to show/hide manager dropdown
  onUserTypeChange(): void {
    this.addUserForm.get('user_type')?.valueChanges.subscribe((value) => {
      if (value === 'employee') {
        this.addUserForm.get('manager')?.setValidators(Validators.required);
      } else {
        this.addUserForm.get('manager')?.clearValidators();
      }
      this.addUserForm.get('manager')?.updateValueAndValidity();
    });
  }
  // Confirm Logout
  confirmLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
