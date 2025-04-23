import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';

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
  @ViewChild('navList') navList!: ElementRef;

  constructor(private router: Router, private authService: AuthService) { }

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
    setTimeout(() => {
      this.ready.emit();
    }, 0);
  }

  ngAfterViewInit() {
    // Phát sự kiện ready sau khi giao diện của SidebarComponent được render
    this.checkNavItemsLayout();

    // Thiết lập resize observer để theo dõi thay đổi kích thước màn hình
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.checkNavItemsLayout();
      });

      if (this.navList?.nativeElement) {
        resizeObserver.observe(this.navList.nativeElement);
      }
    }

    setTimeout(() => {
      this.ready.emit();
    }, 0);
  }

  logout() {
    // Sử dụng AuthService để xử lý đăng xuất
    this.router.navigate(['/logout']);
  }

  private checkNavItemsLayout() {
    if (!this.navList?.nativeElement) return;

    const navListElement = this.navList.nativeElement;
    const containerHeight = navListElement.parentElement.clientHeight;
    const totalItemsHeight = this.navItems.length * 48; // 48px là chiều cao của một nav item

    // Kiểm tra xem có đủ không gian để hiển thị tất cả các items không
    if (totalItemsHeight <= containerHeight) {
      // Nếu đủ không gian, thêm class để áp dụng space-between
      navListElement.classList.add('few-items');
    } else {
      // Nếu không đủ không gian, xóa class để đặt các item từ trên xuống
      navListElement.classList.remove('few-items');
    }
  }
}