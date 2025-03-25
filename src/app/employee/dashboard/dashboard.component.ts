import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

declare let bootstrap: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  travelHistory: any[] = [];
  userRole: string | null = '';
  managerName: string | null = '';
  errorMessage: string | null = null;
  currentPage = 1;
  itemsPerPage = 6;
  showCancelSuccess = false;
  employeeName = '';
  editableRequest: any = {};

  cancelRequestId = '';
  cancelRequestIndex = -1;
  selectedRequest: any = null;

  // Response to manager's request for information
  responseText = '';
  respondingToRequestId: number | null = null;

  // Edit Request modal handling
  editRequest: any = {
    from_location: '',
    to_location: '',
    travel_mode: '',
    start_date: '',
    end_date: '',
    lodging_required: false,
    hotel_preference: '',
    purpose: '',
    additional_notes: ''
  };
  selectedEditRequestId: number | null = null;
  viewMoreModal: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role');
    this.managerName = localStorage.getItem('manager_name');
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.errorMessage = 'Authentication token missing. Please login again.';
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });
    this.fetchTravelHistory(headers);
  }

  fetchTravelHistory(headers: HttpHeaders): void {
    this.http.get<any[]>('http://127.0.0.1:8000/employee/dashboard/', { headers }).subscribe({
      next: (response) => {
        // Exclude cancelled, closed, and is_closed requests properly
        this.travelHistory = response
          .reverse()
          .filter(
            (request) =>
              request.status.toLowerCase() !== 'cancelled' && // Exclude 'Cancelled'
              request.status.toLowerCase() !== 'closed' && // Exclude 'Closed'
              !request.is_closed // Exclude requests where is_closed is true
          );
  
        // Set employee name if data is available
        if (this.travelHistory.length > 0 && this.travelHistory[0].employee_name) {
          this.employeeName = this.travelHistory[0].employee_name;
        }
      },
      error: (error) => {
        this.errorMessage =
          error.status === 401
            ? 'Unauthorized. Please login again.'
            : error.status === 0
            ? 'Cannot connect to server.'
            : 'Failed to load travel history.';
      }
    });
  }
  
  get totalPages(): number {
    return Math.ceil(this.travelHistory.length / this.itemsPerPage);
  }

  get paginatedRequests(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.travelHistory.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // Check if request has notes from manager and info was requested
  hasManagerNotes(request: any): boolean {
    return request.requested_for_info || request.has_manager_notes;
  }

  // Check if a request is editable
  isEditable(status: string | null | undefined): boolean {
    return status?.toLowerCase() === 'pending' || status?.toLowerCase() === 'update';
  }
  
  getActualIndex(request: any): number {
    return this.travelHistory.findIndex((r) => r.request_id === request.request_id);
  }

  // Clean up any leftover modals or backdrops
  clearModals(): void {
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.remove();
    });
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  openModal(modalId: string): void {
    this.clearModals();
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
    this.clearModals();
  }

  // Open View More Modal
  openViewMoreModal(request: any): void {
    this.selectedRequest = request;
    this.openModal('viewMoreModal');
  }

  // Open View Notes Modal - Updated to handle manager notes
  openViewNotesModal(request: any): void {
    this.selectedRequest = {
      manager_notes: request.manager_notes || 'No manager notes available.',
      admin_notes: request.admin_notes || 'No admin notes available.',
      requested_for_info: request.requested_for_info
    };
    this.openModal('viewNotesModal');
  }

  // Open Respond to Manager Modal
  openRespondToManagerModal(request: any): void {
    if (request.requested_for_info) {
      this.respondingToRequestId = request.request_id;
      this.responseText = request.employee_response || '';
      this.openModal('respondToManagerModal');
    }
  }

  // Submit response to manager's request for info
  submitResponseToManager(): void {
    if (!this.respondingToRequestId) return;

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    const payload = {
      request_id: this.respondingToRequestId,
      employee_response: this.responseText,
      response_date: new Date().toISOString().split('T')[0]
    };

    this.http
      .post('http://127.0.0.1:8000/employee/respond-to-manager/', payload, { headers })
      .subscribe({
        next: () => {
          this.closeModal('respondToManagerModal');
          this.fetchTravelHistory(headers); 
          this.showCancelSuccess = true;
          setTimeout(() => (this.showCancelSuccess = false), 3000);
        },
        error: (error) => {
          console.error(error);
          alert('Error submitting response. Please try again.');
        }
      });
  }

  // Open Cancel Modal
  openCancelModal(requestId: string, index: number): void {
    this.cancelRequestId = requestId;
    this.cancelRequestIndex = index;
    this.openModal('cancelModal');
  }

  // Open Edit Modal
  openEditModal(request: any): void {
    this.closeModal('viewMoreModal');
    this.selectedEditRequestId = request.request_id;
    this.editRequest = {
      from_location: request.from_location,
      to_location: request.to_location,
      travel_mode: request.travel_mode,
      start_date: this.formatDateForInput(request.from_date),
      end_date: this.formatDateForInput(request.to_date),
      lodging_required: request.lodging_required,
      hotel_preference: request.hotel_preference || '',
      purpose: request.purpose,
      additional_notes: request.additional_notes || ''
    };

    setTimeout(() => {
      this.openModal('editRequestModal');
    }, 300);
  }

  // Open Logout Modal
  openLogoutModal(): void {
    this.openModal('confirmLogoutModal');
  }

  // Confirm and perform logout
  confirmLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  confirmCancel(): void {
    const token = localStorage.getItem('auth_token');
    if (!token || this.cancelRequestIndex < 0) return;

    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    this.http
      .put(`http://127.0.0.1:8000/employee/cancel-request/${this.cancelRequestId}/`, { status: 'Cancelled' }, { headers })
      .subscribe({
        next: () => {
          this.travelHistory.splice(this.cancelRequestIndex, 1);
          this.closeModal('cancelModal');
          this.showCancelSuccess = true;
          setTimeout(() => (this.showCancelSuccess = false), 3000);
        },
        error: () => {
          alert('Failed to cancel the travel request. Try again.');
        }
      });
  }

  submitEditRequest(): void {
    if (!this.selectedEditRequestId) return;
  
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    });
  
    const payload = {
      from_location: this.editRequest.from_location,
      to_location: this.editRequest.to_location,
      travel_mode: this.editRequest.travel_mode,
      from_date: this.editRequest.start_date,
      to_date: this.editRequest.end_date,
      lodging_required: this.editRequest.lodging_required,
      hotel_preference: this.editRequest.lodging_required ? this.editRequest.hotel_preference : null,
      purpose: this.editRequest.purpose,
      additional_notes: this.editRequest.additional_notes,
      status: 'pending',
      // Reset info request flags if this is a response to a request for info
      requested_for_info: false,
      response_date: new Date().toISOString().split('T')[0],
      is_resubmitted: true,
      resubmitted_date: new Date().toISOString().split('T')[0]
    };
  
    this.http
      .put(
        `http://127.0.0.1:8000/employee/update-request/${this.selectedEditRequestId}/`,
        payload,
        { headers }
      )
      .subscribe({
        next: () => {
          this.closeModal('editRequestModal');
          this.fetchTravelHistory(headers); 
          this.showCancelSuccess = true;
          setTimeout(() => (this.showCancelSuccess = false), 3000);
        },
        error: (error) => {
          console.error(error);
          alert('Error updating travel request. Please try again.');
        }
      });
  }
}