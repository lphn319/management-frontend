import { HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    // Log request
    console.group('API Request');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    if (req.body) {
        console.log('Body:', req.body);
    }
    console.groupEnd();

    const startTime = Date.now();

    return next(req).pipe(
        tap({
            next: (event) => {
                if (event instanceof HttpResponse) {
                    const duration = Date.now() - startTime;

                    // Log response
                    console.group('API Response');
                    console.log('URL:', req.url);
                    console.log('Duration:', duration, 'ms');
                    console.log('Status:', event.status);
                    console.log('Body:', event.body);
                    console.groupEnd();
                }
            },
            error: (error) => {
                const duration = Date.now() - startTime;

                // Log error
                console.group('API Error');
                console.log('URL:', req.url);
                console.log('Duration:', duration, 'ms');
                console.error('Error:', error);
                console.groupEnd();
            }
        })
    );
};