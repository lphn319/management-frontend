import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/user.model';

// Basic auth guard - checks if user is authenticated
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    return true;
};

// Role-based guard - checks if user has specified role(s)
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // First check if user is logged in
    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    // Get required roles from route data
    const requiredRoles = route.data['roles'] as UserRole[] | undefined;

    // If no roles specified, just check authentication
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    // Check if user has any of the required roles
    if (!authService.hasAnyRole(requiredRoles)) {
        // Redirect based on their actual role
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

// Guard specifically for admin routes
export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    if (!authService.hasRole('ADMIN')) {
        // Redirect to appropriate area based on role
        router.navigate(['/']);
        return false;
    }

    return true;
};

// Guard specifically for customer routes
export const customerGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    if (!authService.hasRole('CUSTOMER')) {
        // Redirect to appropriate area based on role
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

// Prevent authenticated users from accessing login/register
export const noAuthGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        // Redirect based on user role
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