import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminRedirectGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        const role = this.authService.getUserRole();
        const url = state.url;
        // Nếu là ADMIN và không phải /portal hoặc không bắt đầu bằng /portal
        if (role === 'ADMIN' && !url.startsWith('/portal')) {
            // Cấm truy cập, chuyển hướng về /portal
            return this.router.parseUrl('/portal');
        }
        // Các trường hợp khác cho phép truy cập
        return true;
    }
}
