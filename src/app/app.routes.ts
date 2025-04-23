import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { DashboardComponent } from './features/portal/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import {
    adminGuard,
    customerGuard,
    roleGuard,
    noAuthGuard,
} from './core/guards/auth.guard';
import { AdminRedirectGuard } from './core/guards/admin-redirect.guard';
import { AuthService } from './features/auth/services/auth.service';
import { inject } from '@angular/core';


export const routes: Routes = [
    // Public routes
    {
        path: '',
        component: HomeComponent,
        canActivate: [AdminRedirectGuard]
    },

    // Auth routes - prevent authenticated users from accessing
    {
        path: 'login',
        canActivate: [noAuthGuard],
        loadComponent: () => import('./features/auth/pages/login-page/login-page.component')
            .then(m => m.LoginPageComponent)
    },
    {
        path: 'register',
        canActivate: [noAuthGuard],
        loadComponent: () => import('./features/auth/pages/register-page/register-page.component')
            .then(m => m.RegisterPageComponent)
    },

    // Admin Portal - ADMIN only
    {
        path: 'portal',
        component: MainLayoutComponent,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'orders', loadComponent: () => import('./features/portal/orders/orders.component').then(m => m.OrdersComponent) },
            { path: 'categories', loadComponent: () => import('./features/portal/categories/categories.component').then(m => m.CategoriesComponent) },
            { path: 'brands', loadComponent: () => import('./features/portal/brands/brands.component').then(m => m.BrandsComponent) },
            { path: 'products', loadComponent: () => import('./features/portal/products/products.component').then(m => m.ProductsComponent) },
            { path: 'suppliers', loadComponent: () => import('./features/portal/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
            { path: 'customers', loadComponent: () => import('./features/portal/customers/customers.component').then(m => m.CustomersComponent) },
            { path: 'imports', loadComponent: () => import('./features/portal/imports/imports.component').then(m => m.ImportsComponent) },
            { path: 'employees', loadComponent: () => import('./features/portal/employees/employees.component').then(m => m.EmployeesComponent) },
        ]
    },

    // Customer area - CUSTOMER only
    {
        path: 'customer',
        canActivate: [customerGuard],
        loadComponent: () => import('./features/customer/customer-dashboard/customer-dashboard.component')
            .then(m => m.CustomerDashboardComponent),
        children: [
            // Add customer-specific routes here
        ]
    },

    {
        path: 'logout',
        component: HomeComponent,  // Use any component
        resolve: {
            logout: () => {
                const authService = inject(AuthService);
                authService.logout();
                return true;
            }
        }
    },

    // Future routes for EMPLOYEE and MANAGER can be added here
    // {
    //     path: 'dashboard',
    //     canActivate: [roleGuard],
    //     data: { roles: ['EMPLOYEE', 'MANAGER'] },
    //     // Component and children routes
    // },
    // {
    //     path: 'management',
    //     canActivate: [roleGuard],
    //     data: { roles: ['MANAGER'] },
    //     // Component and children routes
    // },

    // Route fallback
    { path: '**', redirectTo: '' }
];
