import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse, ApiResponseHelper } from '../models/api-response.model';

export const errorInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occurred';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = error.error.message;
            } else {
                // Server-side error
                errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
            }

            // Trả về một ApiResponse error
            const apiResponse: ApiResponse<null> = ApiResponseHelper.error(errorMessage);

            return throwError(() => apiResponse);
        })
    );
}
