import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/user.model';

// Guard xác thực - kiểm tra xem người dùng đã đăng nhập hay chưa
// Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    return true;
};

// Guard dựa trên vai trò - kiểm tra xem người dùng có vai trò được chỉ định hay không
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Trước tiên, kiểm tra xem người dùng đã đăng nhập chưa
    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    // Lấy các vai trò bắt buộc từ dữ liệu route
    const requiredRoles = route.data['roles'] as UserRole[] | undefined;

    // Nếu không có vai trò nào được chỉ định, chỉ cần kiểm tra xác thực
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    // Kiểm tra xem người dùng có bất kỳ vai trò bắt buộc nào không
    if (!authService.hasAnyRole(requiredRoles)) {
        // Chuyển hướng dựa trên vai trò thực tế của họ
        const userRole = authService.getUserRole();
        if (userRole === 'ADMIN') {
            router.navigate(['/portal']);
        } else {
            router.navigate(['/']);
        }
        return false;
    }

    return true;
};

// Guard route admin
export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    if (!authService.hasRole('ADMIN')) {
        // Chuyển hướng đến khu vực thích hợp dựa trên vai trò
        router.navigate(['/']);
        return false;
    }

    return true;
};

// Guard route khách hàng
export const customerGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    if (!authService.hasRole('CUSTOMER')) {
        // Chuyển hướng đến khu vực thích hợp dựa trên vai trò
        const userRole = authService.getUserRole();
        if (userRole === 'ADMIN') {
            router.navigate(['/portal']);
        } else {
            router.navigate(['/']);
        }
        return false;
    }

    return true;
};

// Ngăn người dùng đã xác thực truy cập trang đăng nhập/đăng ký
export const noAuthGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        // Chuyển hướng dựa trên vai trò người dùng
        const userRole = authService.getUserRole();
        if (userRole === 'ADMIN') {
            router.navigate(['/portal']);
        } else {
            router.navigate(['/']);
        }
        return false;
    }

    return true;
};