import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { EventEmitter, Output } from '@angular/core';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, AfterViewInit {
  @Output() ready = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/portal/dashboard' },
    { label: 'Đơn hàng', icon: 'shopping_cart', route: '/portal/orders' },
    { label: 'Danh mục', icon: 'category', route: '/portal/categories' },
    { label: 'Thương hiệu', icon: 'rtt', route: '/portal/brands' },
    { label: 'Sản phẩm', icon: 'inventory', route: '/portal/products' },
    { label: 'Khách hàng', icon: 'people', route: '/portal/customers' },
    { label: 'Nhà cung cấp', icon: 'contacts_product', route: '/portal/suppliers' },
    { label: 'Nhập hàng', icon: 'local_shipping', route: '/portal/imports' },
    { label: 'Khuyến mãi', icon: 'local_offer', route: '/portal/promotions' },
    { label: 'Báo cáo', icon: 'bar_chart', route: '/portal/reports' },
    { label: 'Nhân viên', icon: 'groups', route: '/portal/employees' },
  ];

  ngOnInit(): void {
    // Emit sự kiện ready ngay khi component được khởi tạo
    // Dùng timeout để đảm bảo template đã render
    setTimeout(() => {
      this.ready.emit();
    }, 0);
  }

  ngAfterViewInit() {
    // Phát sự kiện ready sau khi giao diện của SidebarComponent được render
    setTimeout(() => {
      this.ready.emit();
    }, 0);
  }
}