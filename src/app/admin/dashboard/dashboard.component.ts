import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

declare let bootstrap: any;

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html', 
  styleUrls: ['./dashboard.component.css']  
})
export class AdminDashboardComponent implements OnInit {
  // Core Data
  travelRequests: any[] = [];
  paginatedRequests: any[] = [];
  filteredRequests: any[] = [];
  statusOptions = ['pending', 'approved', 'rejected', 'update'];
  sortOptions = [
    { label: 'Request ID', value: 'request_id' },
    { label: 'Employee Name', value: 'employee_name' },
    { label: 'Start Date', value: 'from_date' },
    { label: 'End Date', value: 'to_date' },
    { label: 'Status', value: 'status' },
  ];

  modalTitle = 'Approve Request';
  modalMessage = 'Add notes for this approval (optional):';
  modalButtonText = 'Confirm Approval';
  closeNotes = '';
  actionType = ''; // 'approve' or 'close'


  

  // Admin-specific Data
  admin_role: string | null = '';
  userRole: string | null = 'admin';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  // Filters & Sorting
  searchForm: FormGroup;
  rejectReason = '';
  requestInfoNotes = '';
  approvalNotes = '';
  selectedRequest: any = null;
  selectedRequestId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      employeeName: [''],
      startDate: [''],
      endDate: [''],
      status: [''],
      sortBy: ['request_id'],
      sortOrder: ['asc'],
    });
  }

  ngOnInit(): void {
    this.checkAdminRole();
    this.loadRequests();
  }

  // Check if Admin
  checkAdminRole(): void {
    const adminRole = localStorage.getItem('role'); // Get role from localStorage
  
    if (adminRole !== 'admin') {
      alert('Unauthorized access. Redirecting to login...');
      this.router.navigate(['/login']);
    }
  }

  // Load Admin Requests
  loadRequests(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    // Admin-specific API to get all requests
    const endpoint = 'http://127.0.0.1:8000/admin/admin-view-request';

    this.http.get(endpoint, { headers }).subscribe({
      next: (data: any) => {
        this.travelRequests = data;
        console.log(data)
        this.applyFilters(); // Apply filters after data load
      },
      error: (error) => this.handleError(error),
    });
  }

  // Apply Filters, Sort, and Paginate
  applyFilters(): void {
    let requests = [...this.travelRequests];

    const { employeeName, startDate, endDate, status, sortBy, sortOrder } =
      this.searchForm.value;

    // Filter by Employee Name
    if (employeeName) {
      requests = requests.filter((req) =>
        req.employee_name.toLowerCase().includes(employeeName.toLowerCase())
      );
    }

    // Filter by Start Date
    if (startDate) {
      requests = requests.filter(
        (req) => new Date(req.from_date) >= new Date(startDate)
      );
    }

    // Filter by End Date
    if (endDate) {
      requests = requests.filter(
        (req) => new Date(req.to_date) <= new Date(endDate)
      );
    }

    // Filter by Status
    if (status) {
      requests = requests.filter((req) => req.status === status);
    }

    // Sort Requests
    requests.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredRequests = requests;
    this.paginateRequests();
  }

  // Paginate Filtered Requests
  paginateRequests(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRequests = this.filteredRequests.slice(
      startIndex,
      endIndex
    );
    this.totalPages = Math.ceil(
      this.filteredRequests.length / this.itemsPerPage
    );
  }

  // Reset Filters
  resetFilters(): void {
    this.searchForm.reset({
      employeeName: '',
      startDate: '',
      endDate: '',
      status: '',
      sortBy: 'request_id',
      sortOrder: 'asc',
    });
    this.applyFilters();
  }

  // Pagination Controls
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateRequests();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateRequests();
    }
  }

  // Determine if a request can be actioned
  isActionable(status: string): boolean {
    const nonActionableStatuses = ['Approved', 'Rejected'];
    return !nonActionableStatuses.includes(status);
  }

  // Open Modal Methods
  openViewMoreModal(request: any): void {
    this.selectedRequest = request;
    this.openModal('viewMoreModal');
  }

  openApproveModal(request: any): void {
    this.selectedRequestId = request.request_id;
    this.openModal('approveModal');
  }

  openRejectModal(request: any): void {
    this.selectedRequestId = request.request_id;
    this.openModal('rejectModal');
  }

  openRequestInfoModal(request: any): void {
    this.selectedRequestId = request.request_id;
    this.openModal('requestInfoModal');
  }

  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  // Confirm Logout
  confirmLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // Approve Request with Notes
  approveRequestWithNotes(requestId: number, notes: string): void {
    this.updateRequestStatus(requestId, 'approved', notes);
  }

  // Reject Request
  rejectRequest(requestId: number, reason: string): void {
    this.updateRequestStatus(requestId, 'rejected', reason);
  }

  // Request Additional Information
  requestMoreInfo(requestId: number, notes: string): void {
    this.updateRequestStatus(requestId, 'requested_for_info', notes);
  }

  // Close Approved Request
  closeApprovedRequest(requestId: number): void {
    this.closeRequest(requestId);
  }

  // Update Request Status for Admin
  updateRequestStatus(requestId: number, status: string, notes: string): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    const endpoint = `http://127.0.0.1:8000/admin/request-info/${requestId}/`;

    const payload = {
      status: status,
      notes: notes,
    };

    this.http.put(endpoint, payload, { headers }).subscribe({
      next: () => {
        alert(`Request ${status} successfully!`);
        this.loadRequests(); // Reload requests after update
      },
      error: (error) => this.handleError(error),
    });

    this.closeModal('approveModal');
    this.closeModal('rejectModal');
    this.closeModal('requestInfoModal');
  }

  closeRequest(requestId: number): void {
    this.selectedRequestId = requestId;
    this.modalTitle = 'Close Request';
    this.modalMessage = 'Add notes while closing this request (optional):';
    this.modalButtonText = 'Confirm Close';
    this.actionType = 'close';
    this.closeNotes = ''; // Clear previous notes
  
    // Open the modal for closing
    const modalElement = document.getElementById('approveModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }


  confirmAction(): void {
    if (!this.selectedRequestId) {
      alert('No request selected.');
      return;
    }
  
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    });
  
    const endpoint =
      this.actionType === 'close'
        ? `http://127.0.0.1:8000/admin/process-close-request/${this.selectedRequestId}/`
        : `http://127.0.0.1:8000/admin/approve-request/${this.selectedRequestId}/`;
  
    const payload = {
      admin_note: this.closeNotes?.trim() || '',
    };
  
    this.http.put(endpoint, payload, { headers }).subscribe({
      next: () => {
        alert(
          this.actionType === 'close'
            ? 'Request closed successfully!'
            : 'Request approved successfully!'
        );
        this.loadRequests(); // Reload after update
        this.closeModal('approveModal');
      },
      error: (error) => {
        console.error('Error:', error);
        alert(
          `Error: ${error.error?.error || 'Failed to process the request.'}`
        );
      },
    });
  }
  
  
  
  // Handle Errors
  handleError(error: any): void {
    if (error.status === 401) {
      alert('Session expired. Redirecting to login...');
      localStorage.clear();
      this.router.navigate(['/login']);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}