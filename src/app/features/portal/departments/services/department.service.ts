import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api/api.service';
import { BaseService } from '../../../../core/services/base/base.service';
import { Department, DepartmentRequest } from '../models/department.model';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService extends BaseService<Department> {
  protected override endpoint = 'v1/departments';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  // Lấy tất cả phòng ban
  override getAll(): Observable<Department[]> {
    console.log(`Đang lấy danh sách phòng ban từ: ${this.endpoint}`);
    return this.apiService.get<any>(`${this.endpoint}`)
      .pipe(
        tap(response => console.log('API Response Departments:', response)),
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu mảng phòng ban như mong đợi');
            return [];
          }
        }),
        catchError(error => {
          console.error('Lỗi khi lấy danh sách phòng ban:', error);
          return throwError(() => new Error(`Không thể lấy danh sách phòng ban: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Lấy phòng ban theo ID
  override getById(id: number): Observable<Department> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        tap(response => console.log(`API Response Department ID ${id}:`, response)),
        map(response => {
          if (response && response.data) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu phòng ban như mong đợi');
            throw new Error('Không tìm thấy dữ liệu phòng ban');
          }
        }),
        catchError(error => {
          console.error(`Lỗi khi lấy phòng ban với id ${id}:`, error);
          return throwError(() => new Error(`Không thể lấy thông tin phòng ban: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Tạo phòng ban mới
  override create(departmentRequest: DepartmentRequest): Observable<Department> {
    return this.apiService.post<any>(`${this.endpoint}`, departmentRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi tạo phòng ban:', error);
          return throwError(() => new Error(`Không thể tạo phòng ban: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Cập nhật phòng ban
  override update(id: number, departmentRequest: DepartmentRequest): Observable<Department> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, departmentRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi cập nhật phòng ban:', error);
          return throwError(() => new Error(`Không thể cập nhật phòng ban: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Xóa phòng ban
  override delete(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi xóa phòng ban:', error);
          return throwError(() => new Error(`Không thể xóa phòng ban: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }
}