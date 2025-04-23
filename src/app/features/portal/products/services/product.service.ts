import { Injectable } from '@angular/core';
import { Product, ProductRequest } from '../models/product';
import { ApiService } from '../../../../core/services/api/api.service';
import { BaseService } from '../../../../core/services/base/base.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { Page } from '../../../../core/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService<Product> {
  protected endpoint = 'v1/products';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  getProductsPaginated(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDirection: string = 'asc',
    filters?: {
      name?: string,
      brandId?: number,
      categoryId?: number,
      minPrice?: number,
      maxPrice?: number,
      inStock?: boolean
    }
  ): Observable<Page<Product>> {
    // Tạo tham số query cơ bản cho phân trang và sắp xếp
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    // Thêm các tham số lọc nếu có
    if (filters) {
      if (filters.name) {
        params = params.set('name', filters.name);
      }
      if (filters.brandId) {
        params = params.set('brandId', filters.brandId.toString());
      }
      if (filters.categoryId) {
        params = params.set('categoryId', filters.categoryId.toString());
      }
      if (filters.minPrice !== undefined) {
        params = params.set('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params = params.set('maxPrice', filters.maxPrice.toString());
      }
      if (filters.inStock !== undefined) {
        params = params.set('inStock', filters.inStock.toString());
      }
    }

    // Gọi API với phân trang - sử dụng endpoint /paginated từ backend
    return this.apiService.get<Page<Product>>(`${this.endpoint}/paginated`, params)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi lấy danh sách sản phẩm phân trang:', error);
          return throwError(() => new Error(`Không thể lấy danh sách sản phẩm: ${error.message || 'Lỗi không xác định'}`));
        })
      );
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

  // Lấy chi tiết sản phẩm theo ID
  override getById(id: number): Observable<Product> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Lỗi khi lấy sản phẩm ID ${id}:`, error);
          return throwError(() => new Error(`Không thể lấy thông tin sản phẩm: ${error.message || 'Lỗi không xác định'}`));
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