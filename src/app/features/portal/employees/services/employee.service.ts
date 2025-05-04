import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api/api.service';
import { BaseService } from '../../../../core/services/base/base.service';
import { Employee, EmployeeRequest, EmployeeStats } from '../models/employee.model';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseService<Employee> {
  protected endpoint = 'v1/employees';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  // Lấy tất cả các nhân viên
  override getAll(): Observable<Employee[]> {
    console.log(`Đang lấy danh sách nhân viên từ: ${this.endpoint}`);
    return this.apiService.get<any>(`${this.endpoint}`)
      .pipe(
        tap(response => console.log('API Response Employees:', response)),
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu mảng nhân viên như mong đợi');
            return [];
          }
        }),
        catchError(error => {
          console.error('Lỗi khi lấy danh sách nhân viên:', error);
          return throwError(() => new Error(`Không thể lấy danh sách nhân viên: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Tạo nhân viên mới
  override create(employeeRequest: EmployeeRequest): Observable<Employee> {
    return this.apiService.post<any>(`${this.endpoint}`, employeeRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi tạo nhân viên:', error);
          return throwError(() => new Error(`Không thể tạo nhân viên: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Cập nhật nhân viên
  override update(id: number, employeeRequest: EmployeeRequest): Observable<Employee> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, employeeRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi cập nhật nhân viên:', error);
          return throwError(() => new Error(`Không thể cập nhật nhân viên: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Xóa nhân viên
  override delete(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi xóa nhân viên:', error);
          return throwError(() => new Error(`Không thể xóa nhân viên: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Cập nhật trạng thái nhân viên
  updateStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<any> {
    // Cách 1: URL encoding thủ công
    const url = `${this.endpoint}/${id}/status?status=${encodeURIComponent(status)}`;

    console.log('Manual URL:', url);

    return this.apiService.patch<any>(url, {})
      .pipe(
        tap(response => console.log('Response:', response)),
        catchError(error => {
          console.error('Error:', error);
          return throwError(() => error);
        })
      );
  }


  // Lấy thống kê nhân viên
  getStatistics(): Observable<EmployeeStats> {
    return this.apiService.get<any>(`${this.endpoint}/statistics`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi lấy thống kê nhân viên:', error);
          return throwError(() => new Error(`Không thể lấy thống kê nhân viên: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Lấy nhân viên theo phòng ban
  getByDepartment(departmentId: number): Observable<Employee[]> {
    const url = `${this.endpoint}/department/${departmentId}`;
    console.log(`Đang lấy nhân viên theo phòng ban: ${url}`);

    return this.apiService.get<any>(url)
      .pipe(
        tap(response => console.log('API Response Employees by department:', response)),
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu mảng nhân viên như mong đợi');
            return [];
          }
        }),
        catchError(error => {
          console.error('Lỗi khi lấy nhân viên theo phòng ban:', error);
          return throwError(() => new Error(`Không thể lấy nhân viên theo phòng ban: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Lấy nhân viên theo trạng thái
  getByStatus(isActive: boolean): Observable<Employee[]> {
    const url = `${this.endpoint}/status?isActive=${isActive}`;
    console.log(`Đang lấy nhân viên theo trạng thái: ${url}`);

    return this.apiService.get<any>(url)
      .pipe(
        tap(response => console.log('API Response Employees by status:', response)),
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu mảng nhân viên như mong đợi');
            return [];
          }
        }),
        catchError(error => {
          console.error('Lỗi khi lấy nhân viên theo trạng thái:', error);
          return throwError(() => new Error(`Không thể lấy nhân viên theo trạng thái: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }
}