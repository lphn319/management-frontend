import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BaseService } from '../base/base.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Supplier, SupplierRequest } from '../../models/supplier.model';
import { Page } from '../../models/page.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SupplierService extends BaseService<Supplier> {
  protected endpoint = 'v1/suppliers';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  // Lấy tất cả các nhà cung cấp
  override getAll(): Observable<Supplier[]> {
    console.log(`Đang lấy danh sách nhà cung cấp từ: ${this.endpoint}`);
    return this.apiService.get<any>(`${this.endpoint}`)
      .pipe(
        tap(response => console.log('API Response Suppliers:', response)),
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu mảng nhà cung cấp như mong đợi');
            return [];
          }
        }),
        catchError(error => {
          console.error('Lỗi khi lấy danh sách nhà cung cấp:', error);
          return throwError(() => new Error(`Không thể lấy danh sách nhà cung cấp: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Thêm phương thức phân trang
  getSuppliersPaginated(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'companyName',
    sortDirection: string = 'asc',
    keyword?: string
  ): Observable<Page<Supplier>> {
    // Tạo tham số query
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    // Thêm tham số keyword nếu có
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    // Gọi API với phân trang
    return this.apiService.get<Page<Supplier>>(`${this.endpoint}/pagination`, params)
      .pipe(
        tap(response => console.log('API Response Paginated Suppliers:', response)),
        map(response => {
          if (response && response.data) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu phân trang như mong đợi');
            return {
              content: [],
              pageable: {
                offset: 0,
                pageNumber: 0,
                pageSize: size,
                paged: true,
                unpaged: false,
                sort: { empty: true, sorted: false, unsorted: true }
              },
              totalElements: 0,
              totalPages: 0,
              last: true,
              size: size,
              number: 0,
              sort: { empty: true, sorted: false, unsorted: true },
              first: true,
              numberOfElements: 0,
              empty: true
            };
          }
        }),
        catchError(error => {
          console.error('Lỗi khi tải danh sách nhà cung cấp phân trang:', error);
          return throwError(() => new Error(`Không thể tải danh sách nhà cung cấp: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Cập nhật trạng thái nhà cung cấp
  updateStatus(id: number, status: string): Observable<Supplier> {
    return this.apiService.patch<Supplier>(`${this.endpoint}/${id}/status`, { status })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi cập nhật trạng thái nhà cung cấp:', error);
          return throwError(() => new Error(`Không thể cập nhật trạng thái: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Cập nhật danh mục của nhà cung cấp
  updateCategories(id: number, categoryIds: number[]): Observable<Supplier> {
    return this.apiService.patch<Supplier>(`${this.endpoint}/${id}/categories`, categoryIds)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi cập nhật danh mục nhà cung cấp:', error);
          return throwError(() => new Error(`Không thể cập nhật danh mục: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Các phương thức khác giữ nguyên
  override getById(id: number): Observable<Supplier> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Lỗi khi lấy nhà cung cấp ID ${id}:`, error);
          return throwError(() => new Error(`Không thể lấy thông tin nhà cung cấp: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Tạo nhà cung cấp mới
  override create(supplierRequest: SupplierRequest): Observable<Supplier> {
    return this.apiService.post<any>(`${this.endpoint}`, supplierRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi tạo nhà cung cấp:', error);
          return throwError(() => new Error(`Không thể tạo nhà cung cấp: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Cập nhật nhà cung cấp
  override update(id: number, supplierRequest: SupplierRequest): Observable<Supplier> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, supplierRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi cập nhật nhà cung cấp:', error);
          return throwError(() => new Error(`Không thể cập nhật nhà cung cấp: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Xóa nhà cung cấp
  override delete(id: number): Observable<void> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi xóa nhà cung cấp:', error);
          return throwError(() => new Error(`Không thể xóa nhà cung cấp: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }
}