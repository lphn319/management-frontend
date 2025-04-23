import { Injectable } from '@angular/core';
import { Product, ProductRequest } from '../models/product';
import { ApiService } from '../../../../core/services/api/api.service';
import { BaseService } from '../../../../core/services/base/base.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService<Product> {
  protected endpoint = 'v1/products';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  // Lấy tất cả các sản phẩm
  override getAll(): Observable<Product[]> {
    console.log(`Đang lấy danh sách sản phẩm từ: ${this.endpoint}`);
    return this.apiService.get<any>(`${this.endpoint}`)
      .pipe(
        tap(response => console.log('API Response Products:', response)),
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response không chứa dữ liệu mảng sản phẩm như mong đợi');
            return [];
          }
        }),
        catchError(error => {
          console.error('Lỗi khi lấy danh sách sản phẩm:', error);
          return throwError(() => new Error(`Không thể lấy danh sách sản phẩm: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Tạo sản phẩm mới
  override create(productRequest: ProductRequest): Observable<Product> {
    return this.apiService.post<any>(`${this.endpoint}`, productRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi tạo sản phẩm:', error);
          return throwError(() => new Error(`Không thể tạo sản phẩm: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Cập nhật sản phẩm
  override update(id: number, productRequest: ProductRequest): Observable<Product> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, productRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi cập nhật sản phẩm:', error);
          return throwError(() => new Error(`Không thể cập nhật sản phẩm: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }

  // Xóa sản phẩm
  override delete(id: number): Observable<void> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi xóa sản phẩm:', error);
          return throwError(() => new Error(`Không thể xóa sản phẩm: ${error.message || 'Lỗi không xác định'}`));
        })
      );
  }
}
