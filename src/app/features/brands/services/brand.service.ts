import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Brand, BrandRequest } from '../models/brand.model';
import { ApiService } from '../../../shared/services/api.service';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class BrandService extends BaseService<Brand> {
  protected endpoint = 'v1/brands';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  // Chỉ cần thêm các phương thức đặc thù cho Brand
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
}