import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CustomerDialogComponent } from './customer-dialog/customer-dialog.component';
import { Customer, CustomerStats } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  displayedColumns: string[] = ['avatar', 'info', 'address', 'membership', 'orders', 'status', 'actions'];
  customers = new MatTableDataSource<Customer>();
  customerStats: CustomerStats = {
    total: 0,
    active: 0,
    orders: 0,
    revenue: 0
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit() {
    this.customers.paginator = this.paginator;
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Get initials from full name
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // Generate color based on name
  getAvatarColor(name: string): string {
    if (!name) return '#2196f3';
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#607d8b'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Calculate customer statistics
  calculateStats(customers: Customer[]): void {
    this.customerStats.total = customers.length;
    this.customerStats.active = customers.filter(c => c.status === 'active').length;

    let totalOrders = 0;
    let totalRevenue = 0;

    customers.forEach(customer => {
      totalOrders += customer.orderCount;
      totalRevenue += customer.totalSpent;
    });

    this.customerStats.orders = totalOrders;
    this.customerStats.revenue = totalRevenue;
  }

  // Mock dữ liệu khách hàng - trong thực tế sẽ được lấy từ API
  loadCustomers(): void {
    const mockCustomers: Customer[] = [
      {
        id: 1,
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        membership: 'Vàng',
        points: 850,
        orderCount: 12,
        totalSpent: 15800000,
        status: 'active',
        registeredAt: new Date('2023-01-15')
      },
      {
        id: 2,
        fullName: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0912345678',
        address: '456 Lê Lợi, Quận 3, TP.HCM',
        membership: 'Bạc',
        points: 450,
        orderCount: 6,
        totalSpent: 7500000,
        status: 'active',
        registeredAt: new Date('2023-03-22')
      },
      {
        id: 3,
        fullName: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0923456789',
        address: '789 Nguyễn Trãi, Quận 5, TP.HCM',
        membership: 'Kim cương',
        points: 1250,
        orderCount: 20,
        totalSpent: 28500000,
        status: 'active',
        registeredAt: new Date('2022-11-05')
      },
      {
        id: 4,
        fullName: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0934567890',
        address: '101 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        membership: 'Thường',
        points: 120,
        orderCount: 2,
        totalSpent: 2300000,
        status: 'active',
        registeredAt: new Date('2024-01-10')
      },
      {
        id: 5,
        fullName: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        phone: '0945678901',
        address: '202 Hai Bà Trưng, Quận 1, TP.HCM',
        membership: 'Thường',
        points: 50,
        orderCount: 1,
        totalSpent: 950000,
        status: 'inactive',
        registeredAt: new Date('2024-02-17')
      },
      {
        id: 6,
        fullName: 'Vũ Thị F',
        email: 'vuthif@example.com',
        phone: '0956789012',
        address: '303 Lý Thường Kiệt, Quận 11, TP.HCM',
        membership: 'Bạc',
        points: 380,
        orderCount: 5,
        totalSpent: 6700000,
        status: 'active',
        registeredAt: new Date('2023-08-30')
      },
      {
        id: 7,
        fullName: 'Đặng Văn G',
        email: 'dangvang@example.com',
        phone: '0967890123',
        address: '404 Võ Văn Tần, Quận 3, TP.HCM',
        membership: 'Vàng',
        points: 780,
        orderCount: 11,
        totalSpent: 13500000,
        status: 'active',
        registeredAt: new Date('2023-05-12')
      },
      {
        id: 8,
        fullName: 'Mai Thị H',
        email: 'maithih@example.com',
        phone: '0978901234',
        address: '505 Điện Biên Phủ, Bình Thạnh, TP.HCM',
        membership: 'Thường',
        points: 180,
        orderCount: 3,
        totalSpent: 3200000,
        status: 'inactive',
        registeredAt: new Date('2023-11-25')
      },
      {
        id: 9,
        fullName: 'Phan Văn I',
        email: 'phanvani@example.com',
        phone: '0989012345',
        address: '606 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
        membership: 'Kim cương',
        points: 1580,
        orderCount: 25,
        totalSpent: 32000000,
        status: 'active',
        registeredAt: new Date('2022-09-18')
      },
      {
        id: 10,
        fullName: 'Trương Thị K',
        email: 'truongthik@example.com',
        phone: '0990123456',
        address: '707 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
        membership: 'Bạc',
        points: 420,
        orderCount: 7,
        totalSpent: 8100000,
        status: 'active',
        registeredAt: new Date('2023-06-02')
      }
    ];

    this.customers.data = mockCustomers;
    this.calculateStats(mockCustomers);
  }

  // Mở dialog thêm/sửa khách hàng
  openCustomerDialog(customer?: Customer): void {
    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '600px',
      data: {
        customer: customer
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification(
          customer ? 'Cập nhật khách hàng thành công' : 'Thêm khách hàng thành công',
          'success'
        );
        this.loadCustomers(); // Refresh dữ liệu
      }
    });
  }

  // Xem chi tiết khách hàng
  viewCustomerDetail(id: number): void {
    const customer = this.customers.data.find(c => c.id === id);
    if (customer) {
      this.dialog.open(CustomerDialogComponent, {
        width: '600px',
        data: {
          customer: customer,
          viewOnly: true
        }
      });
    }
  }

  // Cập nhật trạng thái khách hàng
  updateStatus(id: number, status: 'active' | 'inactive'): void {
    // Trong thực tế, sẽ gọi API để cập nhật
    const updatedCustomers = this.customers.data.map(customer => {
      if (customer.id === id) {
        return {
          ...customer,
          status: status
        };
      }
      return customer;
    });

    this.customers.data = updatedCustomers;
    this.calculateStats(updatedCustomers);

    const statusText = status === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
    this.showNotification(`Tài khoản khách hàng đã được ${statusText}`, 'success');
  }

  // Xem đơn hàng của khách hàng
  viewCustomerOrders(id: number): void {
    // Trong thực tế, sẽ điều hướng đến trang đơn hàng với bộ lọc khách hàng
    console.log(`Xem đơn hàng của khách hàng ID: ${id}`);
    this.showNotification('Chuyển hướng đến trang đơn hàng', 'info');
  }

  // Xóa khách hàng
  deleteCustomer(id: number): void {
    // Trong thực tế, sẽ gọi API để xóa
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      // Check if the customer has orders
      const customer = this.customers.data.find(c => c.id === id);
      if (customer && customer.orderCount > 0) {
        this.showNotification(
          `Không thể xóa khách hàng có ${customer.orderCount} đơn hàng`,
          'error'
        );
        return;
      }

      // Filter out the deleted customer
      const updatedCustomers = this.customers.data.filter(customer => customer.id !== id);
      this.customers.data = updatedCustomers;
      this.calculateStats(updatedCustomers);

      this.showNotification('Xóa khách hàng thành công', 'success');
    }
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }
}