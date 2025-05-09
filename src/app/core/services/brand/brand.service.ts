import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Brand } from '../../models/brand.model';
import { ApiService } from '../api/api.service';
import { BaseService } from '../base/base.service';
import { Page } from '../../models/page.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BrandService extends BaseService<Brand> {
  protected endpoint = 'v1/brands';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  updateStatus(id: number, status: string): Observable<Brand> {
    return this.apiService.patch<Brand>(`${this.endpoint}/${id}/status`, { status })
      .pipe(
        map(response => response.data)
      );
  }

  getFeaturedBrands(limit: number = 5): Observable<Brand[]> {
    return this.apiService.get<Brand[]>(`${this.endpoint}/featured?limit=${limit}`)
      .pipe(
        map(response => response.data)
      );
  }

  getStatistics(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/statistics`)
      .pipe(
        map(response => response.data)
      );
  }

  getBrandsPaginated(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    sortDirection: string = 'asc',
    status?: string
  ): Observable<Page<Brand>> {
    // Tạo tham số query
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    // Thêm tham số status nếu có
    if (status) {
      params = params.set('status', status);
    }

    // Gọi API với phân trang
    return this.apiService.get<Page<Brand>>(`${this.endpoint}/pagination`, params)
      .pipe(
        map(response => response.data)
      );
  }
}