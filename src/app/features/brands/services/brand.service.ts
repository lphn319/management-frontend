import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Brand, BrandRequest } from '../models/brand.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private apiUrl = 'http://localhost:8085/api/v1/brands';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Brand[]> {
    return this.http.get<ApiResponse<Brand[]>>(this.apiUrl)
      .pipe(
        map(response => response.data)
      );
  }

  getById(id: number): Observable<Brand> {
    return this.http.get<ApiResponse<Brand>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  create(brand: BrandRequest): Observable<Brand> {
    return this.http.post<ApiResponse<Brand>>(this.apiUrl, brand)
      .pipe(
        map(response => response.data)
      );
  }

  update(id: number, brand: BrandRequest): Observable<Brand> {
    return this.http.put<ApiResponse<Brand>>(`${this.apiUrl}/${id}`, brand)
      .pipe(
        map(response => response.data)
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  updateStatus(id: number, status: string): Observable<Brand> {
    return this.http.patch<ApiResponse<Brand>>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        map(response => response.data)
      );
  }

  getFeaturedBrands(limit: number = 5): Observable<Brand[]> {
    return this.http.get<ApiResponse<Brand[]>>(`${this.apiUrl}/featured?limit=${limit}`)
      .pipe(
        map(response => response.data)
      );
  }

  getStatistics(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/statistics`)
      .pipe(
        map(response => response.data)
      );
  }
}