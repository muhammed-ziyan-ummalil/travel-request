import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css'],
})
export class NewRequestComponent implements OnInit {
  travelForm: FormGroup;
  travel_request_url = 'http://127.0.0.1:8000/employee/submit-request/';
  managerName = ''; //  Holds manager's name
  managerId: string | null = null; //  Holds manager's ID
  showSuccessModal = false; // Controls modal visibility

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    // Define form controls with validation
    this.travelForm = this.fb.group({
      from_location: ['', Validators.required],
      to_location: ['', Validators.required],
      travel_mode: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      lodging_required: [false],
      hotel_preference: [''],
      purpose: ['', Validators.required],
      manager: [''],
    });
  }

  ngOnInit() {
    // Get manager name and id from localStorage if available
    this.managerName = localStorage.getItem('manager_name') || '';
    this.managerId = localStorage.getItem('manager_id');
    
    //  Set manager_id in form if available
    if (this.managerId) {
      this.travelForm.patchValue({
        manager: this.managerId,
      });
    }
  }

  goBackToDashboard() {
    this.router.navigate(['/employee/dashboard']);
  }

  submitRequest() {
    if (this.travelForm.valid) {
      //  Prepare request data for submission
      const requestData = {
        from_location: this.travelForm.value.from_location,
        to_location: this.travelForm.value.to_location,
        travel_mode: this.travelForm.value.travel_mode,
        start_date: this.travelForm.value.start_date,
        end_date: this.travelForm.value.end_date,
        lodging_required: this.travelForm.value.lodging_required,
        hotel_preference: this.travelForm.value.lodging_required
          ? this.travelForm.value.hotel_preference
          : '',
        purpose: this.travelForm.value.purpose,
        manager: this.managerId,
      };

      //  Add Authorization token for authenticated requests
      const headers = new HttpHeaders({
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      });

      // Log request data for debugging
      console.log('Request Data:', requestData);
      
      // Send HTTP POST request to backend
      this.http.post(this.travel_request_url, requestData, { headers }).subscribe({
        next: () => {
          // Show success modal after submission
          this.showSuccessModal = true;
          setTimeout(() => {
            this.showSuccessModal = false; // Auto-close modal after 3 seconds
            this.goBackToDashboard(); // Redirect to dashboard
          }, 3000);

          this.travelForm.reset(); // Reset form after submission
          // Retain manager details after reset
          if (this.managerId) {
            this.travelForm.patchValue({ manager: this.managerId });
          }
        },
        error: (error) => {
          console.error('Error:', error);
          if (error.status === 400) {
            alert(error.error?.error || 'Invalid input. Please check the form.');
          } else if (error.status === 401) {
            alert('Authentication failed. Please log in again.');
          } else {
            alert('An unexpected error occurred. Please try again later.');
          }
        },
      });
    } else {
      alert('Please fill out all required fields.');
    }
  }

  closeModal() {
    this.showSuccessModal = false;
    this.goBackToDashboard();
  }
}
