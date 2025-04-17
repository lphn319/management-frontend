import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

export abstract class BaseService<T> {
  protected abstract endpoint: string;

  constructor(protected apiService: ApiService) { }

  getAll(): Observable<T[]> {
    return this.apiService.get<T[]>(this.endpoint)
      .pipe(
        map(response => response.data)
      );
  }

  getById(id: number): Observable<T> {
    return this.apiService.get<T>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  create(item: any): Observable<T> {
    return this.apiService.post<T>(this.endpoint, item)
      .pipe(
        map(response => response.data)
      );
  }

  update(id: number, item: any): Observable<T> {
    return this.apiService.put<T>(`${this.endpoint}/${id}`, item)
      .pipe(
        map(response => response.data)
      );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

}