import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api/api.service';
import { BaseService } from '../../../../core/services/base/base.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService<Category> {
  protected endpoint = 'v1/categories';

  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  // Override getAll method to add better logging and error handling
  override getAll(): Observable<Category[]> {
    console.log(`Fetching categories from: ${this.endpoint}`);
    return this.apiService.get<any>(`${this.endpoint}`)
      .pipe(
        tap(response => {
          console.log('API Response:', response);
          // Check if the response has the expected structure
          if (!response || !response.data) {
            console.error('Invalid API response format:', response);
          }
        }),
        map(response => {
          // Check if we have a valid response with data
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.error('API response does not contain expected data array');
            return [];
          }
        }),
        catchError(error => {
          console.error('Error fetching categories:', error);
          // Always return an Observable with throwError for proper error propagation
          return throwError(() => new Error(`Failed to fetch categories: ${error.message || 'Unknown error'}`));
        })
      );
  }


  updateStatus(id: number, status: string): Observable<Category> {
    return this.apiService.patch<Category>(`${this.endpoint}/${id}/status`, { status })
      .pipe(
        map(response => response.data)
      );
  }

  // Lấy danh sách phẳng và điều chỉnh các thuộc tính parent
  getProcessedCategories(): Observable<Category[]> {
    return this.getAll().pipe(
      map(categories => {
        // Chuyển đổi các danh mục để thêm thuộc tính parent (nếu component hiện tại yêu cầu)
        return categories.map(category => {
          if (category.parentId) {
            const parentCategory = categories.find(c => c.id === category.parentId);
            return {
              ...category,
              parent: parentCategory ? { id: parentCategory.id, name: parentCategory.name } : null
            };
          }
          return category;
        });
      })
    );
  }

  // getStatistics(): Observable<any> {
  //   return this.apiService.get<any>(`${this.endpoint}/statistics`)
  //     .pipe(
  //       map(response => response.data)
  //     );
  // }
}
