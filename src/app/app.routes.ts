import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    // Route mặc định đến trang Home
    { path: '', component: HomeComponent },
    { path: 'login', loadComponent: () => import('./auth/pages/login-page/login-page.component').then(m => m.LoginPageComponent) },

    // Portal/Admin routes với MainLayout
    {
        path: 'portal',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'orders', loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent) },
            { path: 'categories', loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
            { path: 'brands', loadComponent: () => import('./features/brands/brands.component').then(m => m.BrandsComponent) },
            { path: 'products', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
            { path: 'suppliers', loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
            { path: 'customers', loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent) },
            { path: "imports", loadComponent: () => import('./features/imports/imports.component').then(m => m.ImportsComponent) },
            { path: "employees", loadComponent: () => import('./features/employees/employees.component').then(m => m.EmployeesComponent) },

        ]
    },

    // Route fallback
    { path: '**', redirectTo: '' }
];
