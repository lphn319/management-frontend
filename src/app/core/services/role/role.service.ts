import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BaseService } from '../base/base.service';
import { Role, RoleRequest } from '../../models/role.model';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService<Role> {
  protected override endpoint = 'v1/roles';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  // Lấy tất cả vai trò
  override getAll(): Observable<Role[]> {
    return this.apiService.get<any>(`${this.endpoint}`)
      .pipe(
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response does not contain expected data array');
            return [];
          }
        }),
        catchError(error => {
          console.error('Error fetching roles:', error);
          return throwError(() => new Error(`Failed to fetch roles: ${error.message || 'Unknown error'}`));
        })
      );
  }

  // Lấy vai trò theo ID
  override getById(id: number): Observable<Role> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error fetching role with id ${id}:`, error);
          return throwError(() => new Error(`Failed to fetch role: ${error.message || 'Unknown error'}`));
        })
      );
  }

  // Lấy vai trò theo tên
  getByName(name: string): Observable<Role> {
    return this.apiService.get<any>(`${this.endpoint}/name/${name}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error fetching role with name ${name}:`, error);
          return throwError(() => new Error(`Failed to fetch role: ${error.message || 'Unknown error'}`));
        })
      );
  }

  // Tạo vai trò mới
  override create(roleRequest: RoleRequest): Observable<Role> {
    return this.apiService.post<any>(`${this.endpoint}`, roleRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error creating role:', error);
          return throwError(() => new Error(`Failed to create role: ${error.message || 'Unknown error'}`));
        })
      );
  }

  // Cập nhật vai trò
  override update(id: number, roleRequest: RoleRequest): Observable<Role> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, roleRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error updating role:', error);
          return throwError(() => new Error(`Failed to update role: ${error.message || 'Unknown error'}`));
        })
      );
  }

  // Xóa vai trò
  override delete(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting role:', error);
          return throwError(() => new Error(`Failed to delete role: ${error.message || 'Unknown error'}`));
        })
      );
  }
}
