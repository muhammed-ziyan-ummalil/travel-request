import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private baseUrl = 'http://127.0.0.1:8000/manager/';

  constructor(private http: HttpClient) {}

  getRequests(headers: HttpHeaders): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}dashboard/`, { headers });
  }

  getRequestById(requestId: number, headers: HttpHeaders): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}view-request/${requestId}/`, { headers });
  }

  approveRequest(requestId: number, payload: any, headers: HttpHeaders): Observable<any> {
    return this.http.put(`${this.baseUrl}approve-request/${requestId}/`, payload, { headers });
  }

  rejectRequest(requestId: number, payload: any, headers: HttpHeaders): Observable<any> {
    return this.http.put(`${this.baseUrl}reject-request/${requestId}/`, payload, { headers });
  }

  requestInfo(requestId: number, payload: any, headers: HttpHeaders): Observable<any> {
    return this.http.put(`${this.baseUrl}request-info/${requestId}/`, payload, { headers });
  }
}
