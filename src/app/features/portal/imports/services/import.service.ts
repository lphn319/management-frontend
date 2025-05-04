import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Import } from '../models/import.model';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../../core/services/api/api.service';
import { BaseService } from '../../../../core/services/base/base.service';
import { Page } from '../../../../core/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ImportService extends BaseService<Import> {
  protected endpoint = 'v1/imports';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  getImportsPaginated(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    filters?: {
      supplierId?: number,
      employeeId?: number,
      status?: string
    }
  ): Observable<Page<Import>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    // Thêm các tham số lọc nếu có
    if (filters) {
      if (filters.supplierId) {
        params = params.set('supplierId', filters.supplierId.toString());
      }
      if (filters.employeeId) {
        params = params.set('employeeId', filters.employeeId.toString());
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
    }

    return this.apiService.get<Page<Import>>(`${this.endpoint}/paginated`, params)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi lấy danh sách đơn nhập hàng phân trang:', error);
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: size,
            number: page,
            pageable: {
              pageNumber: page,
              pageSize: size,
              offset: page * size,
              paged: true,
              unpaged: false,
              sort: {
                empty: true,
                sorted: false,
                unsorted: true
              }
            },
            first: page === 0,
            last: true,
            numberOfElements: 0,
            empty: true,
            sort: {
              empty: true,
              sorted: false,
              unsorted: true
            }
          });
        })
      );
  }

  override getById(id: number): Observable<Import> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Lỗi khi lấy thông tin đơn nhập hàng ID ${id}:`, error);
          throw error;
        })
      );
  }

  updateStatus(id: number, status: string): Observable<Import> {
    return this.apiService.patch<Import>(`${this.endpoint}/${id}/status?status=${status}`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Lỗi khi cập nhật trạng thái đơn nhập hàng ID ${id}:`, error);
          throw new Error(`Không thể cập nhật trạng thái đơn nhập hàng: ${error.message || 'Lỗi không xác định'}`);
        })
      );
  }
}