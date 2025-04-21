
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {
  ApiResponse,
  ApiResponseHelper
} from '../../models/api-response.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8085/api'; // Replace with your API base URL

  constructor(private http: HttpClient) { }

  get<T>(endpoint: string, params?: HttpParams): Observable<ApiResponse<T>> {
    const options = params ? { params } : {};
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data);
  }

  patch<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'Lỗi kết nối đến máy chủ';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.status) {
      // HTTP status error
      switch (error.status) {
        case 400: errorMessage = 'Yêu cầu không hợp lệ'; break;
        case 401: errorMessage = 'Không được phép truy cập'; break;
        case 403: errorMessage = 'Truy cập bị từ chối'; break;
        case 404: errorMessage = 'Không tìm thấy tài nguyên'; break;
        case 500: errorMessage = 'Lỗi máy chủ'; break;
        default: errorMessage = `Lỗi HTTP ${error.status}`;
      }
    }

    return throwError(() => ({ success: false, message: errorMessage }));
  }
}
