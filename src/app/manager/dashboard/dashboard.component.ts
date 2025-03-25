import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

declare let bootstrap: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  travelRequests: any[] = [];
  filteredRequests: any[] = [];
  userRole: string | null = '';
  managerName: string | null = '';
  errorMessage: string | null = null;
  currentPage = 1;
  itemsPerPage = 6;
  selectedRequest: any = null;
  selectedRequestId: number | null = null;
  showApprovalSuccess = false;
  rejectReason = '';
  approvalNotes = '';
  requestInfoNotes = '';

  // Search and filter properties
  searchForm: FormGroup;
  statusOptions = ['All', 'Pending', 'Approved', 'Rejected', 'Update'];
  sortOptions = [
    { value: 'request_id', label: 'Request ID' },
    { value: 'employee_name', label: 'Employee Name' },
    { value: 'purpose', label: 'Purpose' },
    { value: 'from_date', label: 'Start Date' },
    { value: 'to_date', label: 'End Date' },
    { value: 'status', label: 'Status' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      employeeName: [''],
      startDate: [''],
      endDate: [''],
      status: ['All'],
      sortBy: ['request_id'], // Default sort by request_id
      sortOrder: ['desc']     // Default descending order
    });
  }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role');
    this.managerName = localStorage.getItem('manager_name');
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.errorMessage = 'Authentication token missing. Please login again.';
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });
    this.fetchTravelRequests(headers);

    // Subscribe to form value changes to trigger filtering
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  // Check if a request is actionable based on its status
  isActionable(status: string): boolean {
    return status.toLowerCase() === 'pending';
  }

  // Fetch Requests for Manager
  fetchTravelRequests(headers: HttpHeaders): void {
    this.http
      .get<any[]>('http://127.0.0.1:8000/manager/view-requests/', { headers })
      .subscribe({
        next: (response) => {
          this.travelRequests = response
            .reverse()
            .filter(
              (request) =>
                request.status.toLowerCase() !== 'closed' && !request.is_closed
            );
          this.filteredRequests = [...this.travelRequests];
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage =
            error.status === 401
              ? 'Unauthorized. Please login again.'
              : error.status === 0
              ? 'Cannot connect to server.'
              : 'Failed to load travel requests.';
        },
      });
  }

  // Apply filters and sorting to the requests
  applyFilters(): void {
    const formValues = this.searchForm.value;

    let filtered = [...this.travelRequests];

    // Filter by employee name
    if (formValues.employeeName) {
      const nameQuery = formValues.employeeName.toLowerCase();
      filtered = filtered.filter(request =>
        request.employee_name.toLowerCase().includes(nameQuery)
      );
    }

    // Filter by date range
    if (formValues.startDate && formValues.endDate) {
      const startDate = new Date(formValues.startDate);
      const endDate = new Date(formValues.endDate);
    
      filtered = filtered.filter(request => {
        const requestFromDate = new Date(request.from_date);
        const requestToDate = new Date(request.to_date);
    
        return requestFromDate >= startDate && requestToDate <= endDate;
      });
    }

    // Filter by status
    if (formValues.status && formValues.status !== 'All') {
      filtered = filtered.filter(request =>
        request.status.toLowerCase() === formValues.status.toLowerCase()
      );
    }

    // Sort results
    if (formValues.sortBy) {
      const sortField = formValues.sortBy;
      const sortDirection = formValues.sortOrder === 'asc' ? 1 : -1;

      filtered.sort((a, b) => {
        if (sortField === 'from_date' || sortField === 'to_date') {
          return sortDirection * (new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime());
        } else if (sortField === 'employee_name' || sortField === 'status' || sortField === 'purpose') {
          return sortDirection * a[sortField].localeCompare(b[sortField]);
        } else {
          return sortDirection * (a[sortField] - b[sortField]);
        }
      });
    }

    this.filteredRequests = filtered;
    this.currentPage = 1; // Reset to first page when filters change
  }

  // Reset all filters
  resetFilters(): void {
    this.searchForm.reset({
      employeeName: '',
      startDate: '',
      endDate: '',
      status: 'All',
      sortBy: 'request_id',
      sortOrder: 'desc'
    });
    this.applyFilters();
  }

  // Pagination Calculations
  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }

  get paginatedRequests(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // Open View More Modal
  openViewMoreModal(request: any): void {
    this.selectedRequest = request;
    this.openModal('viewMoreModal');
  }

  // Open Reject Modal
  openRejectModal(request: any): void {
    this.selectedRequest = request;
    this.selectedRequestId = request.request_id;
    this.rejectReason = ''; // Reset the reason
    this.openModal('rejectModal');
  }

  // Open Approve Modal
  openApproveModal(request: any): void {
    this.selectedRequest = request;
    this.selectedRequestId = request.request_id;
    this.approvalNotes = ''; // Reset notes
    this.openModal('approveModal');
  }

  // Open Request Info Modal
  openRequestInfoModal(request: any): void {
    this.selectedRequest = request;
    this.selectedRequestId = request.request_id;
    this.requestInfoNotes = ''; // Reset notes
    this.openModal('requestInfoModal');
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

  // Open Modal by ID
  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  // Close Modal by ID
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  // Approve Request with Notes
  approveRequestWithNotes(requestId: number | null, notes: string): void {
    if (!requestId) {
      alert('Invalid request');
      return;
    }

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    const payload = {
      request_id: requestId,
      status: 'approved',
      notes: notes,
      requested_for_info: true,
      has_manager_notes: true,
      info_requested_date: new Date().toISOString().split('T')[0]
    };

    this.http
      .post('http://127.0.0.1:8000/manager_handle_request/', payload, { headers })
      .subscribe({
        next: () => {
          this.fetchTravelRequests(headers); // Refresh the list
          this.showApprovalSuccess = true;
          setTimeout(() => (this.showApprovalSuccess = false), 3000);
          this.closeModal('approveModal'); // Close the modal
        },
        error: (error) => {
          alert('Error approving request. Please try again.');
        },
      });
  }

  // Basic Approve Request (without notes)
  approveRequest(requestId: number): void {
    if (!requestId) return;

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    const payload = {
      request_id: requestId,
      status: 'approved',
      requested_for_info: false, 
      has_manager_notes: false
    };

    this.http
      .post('http://127.0.0.1:8000/manager_handle_request/', payload, { headers })
      .subscribe({
        next: () => {
          this.fetchTravelRequests(headers); // Refresh the list
          this.showApprovalSuccess = true;
          setTimeout(() => (this.showApprovalSuccess = false), 3000);
        },
        error: (error) => {
          alert('Error approving request. Please try again.');
        },
      });
  }

  // Reject Request with reason
  rejectRequest(requestId: number | null, reason: string): void {
    if (!requestId || !reason) {
      alert('Invalid request or missing rejection reason.');
      return;
    }

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    const payload = {
      request_id: requestId,
      status: 'rejected',
      notes: reason,
      requested_for_info: true, // Always true for rejections with notes
      has_manager_notes: true,
      info_requested_date: new Date().toISOString().split('T')[0]
    };

    this.http
      .post('http://127.0.0.1:8000/manager_handle_request/', payload, { headers })
      .subscribe({
        next: () => {
          this.fetchTravelRequests(headers); // Refresh the list
          this.showApprovalSuccess = true;
          setTimeout(() => (this.showApprovalSuccess = false), 3000);
          this.closeModal('rejectModal'); // Close the reject modal
        },
        error: (error) => {
          alert('Error rejecting request. Please try again.');
        },
      });
  }

  // Request more information
  requestMoreInfo(requestId: number | null, notes: string): void {
    if (!requestId || !notes) {
      alert('Invalid request or missing notes.');
      return;
    }

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    const payload = {
      request_id: requestId,
      status: 'update',
      notes: notes,
      requested_for_info: true, // Always true for info requests
      has_manager_notes: true,
      info_requested_date: new Date().toISOString().split('T')[0]
    };

    this.http
      .post('http://127.0.0.1:8000/manager_handle_request/', payload, { headers })
      .subscribe({
        next: () => {
          this.fetchTravelRequests(headers); // Refresh the list
          this.showApprovalSuccess = true;
          setTimeout(() => (this.showApprovalSuccess = false), 3000);
          this.closeModal('requestInfoModal'); // Close the modal
        },
        error: (error) => {
          alert('Error requesting information. Please try again.');
        },
      });
  }
}