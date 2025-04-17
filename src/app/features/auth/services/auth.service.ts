import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthResponse } from '../models/auth.model';
import { LoginRequest } from '../models/login-request.model';
import { UserLogin, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<UserLogin | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      // Kiểm tra token trong cả localStorage và sessionStorage
      const token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);

      console.log('Auth debug - token exists:', !!token);
      console.log('Auth debug - userData exists:', !!userData);

      if (token && userData) {
        const user = JSON.parse(userData) as UserLogin;
        this.currentUserSubject.next(user);
        console.log('Auth debug - User loaded from storage:', user);
      } else {
        this.currentUserSubject.next(null);
        console.log('Auth debug - No user in storage');
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<UserLogin> {
    // Đảm bảo rememberMe không phải là undefined
    const rememberMe = credentials.rememberMe === true;

    // Tạo payload chỉ với email và password nếu backend không hỗ trợ rememberMe
    const loginPayload = {
      email: credentials.email,
      password: credentials.password,
      rememberMe: rememberMe
    };

    return this.apiService.post<AuthResponse>('auth/login', loginPayload)
      .pipe(
        map(response => {
          if (!response || !response.data) {
            throw new Error('Phản hồi không hợp lệ từ máy chủ');
          }
          return response.data;
        }),
        tap(data => {
          if (!data || !data.user) {
            throw new Error('Dữ liệu người dùng không hợp lệ');
          }

          this.storeAuthData(data, rememberMe);
          this.currentUserSubject.next(data.user);

          // Chuyển hướng dựa trên role
          const userRole = data.user.roleName;
          if (userRole === 'ADMIN') {
            this.router.navigate(['/portal']);
          } else {
            this.router.navigate(['/']);
          }
        }),
        map(data => data.user),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    try {
      // Xóa token khỏi cả localStorage và sessionStorage
      localStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<string> {
    // Kiểm tra refresh token trong cả localStorage và sessionStorage
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<AuthResponse>('auth/refresh-token', { refreshToken })
      .pipe(
        map(response => {
          if (!response || !response.data) {
            throw new Error('Phản hồi không hợp lệ từ máy chủ');
          }
          return response.data;
        }),
        tap(data => {
          if (!data.accessToken || !data.refreshToken) {
            throw new Error('Token không hợp lệ');
          }

          // Kiểm tra xem token cũ được lưu ở đâu
          const isLongLived = localStorage.getItem(this.TOKEN_KEY) !== null;
          const storage = isLongLived ? localStorage : sessionStorage;

          // Lưu token mới vào đúng storage
          storage.setItem(this.TOKEN_KEY, data.accessToken);
          storage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
        }),
        map(data => data.accessToken),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): UserLogin | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getUserRole(): UserRole | null {
    const user = this.currentUserSubject.value;
    // Kiểm tra cả user và user.role
    return user ? user.roleName : null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    // Kiểm tra cả user và user.role
    return !!user && user.roleName === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();
    return !!userRole && roles.includes(userRole);
  }

  getToken(): string | null {
    try {
      // Kiểm tra token trong cả localStorage và sessionStorage
      return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private storeAuthData(authData: AuthResponse, rememberMe: boolean): void {
    try {
      if (!authData || !authData.accessToken || !authData.refreshToken || !authData.user) {
        console.error('Invalid auth data to store');
        return;
      }

      // Chọn storage dựa trên rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;

      // Lưu token vào storage tương ứng
      storage.setItem(this.TOKEN_KEY, authData.accessToken);
      storage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);

      // Dữ liệu người dùng luôn lưu trong localStorage
      localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }
}
