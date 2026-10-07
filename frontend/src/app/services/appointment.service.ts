import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5002/api/appointments';
  private usersUrl = 'http://localhost:5002/api/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  getAppointments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getAuthHeaders());
  }

  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersUrl}/doctors`, this.getAuthHeaders());
  }

  createAppointment(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, this.getAuthHeaders());
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status }, this.getAuthHeaders());
  }

  addPrescription(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/prescription`, data, this.getAuthHeaders());
  }
}