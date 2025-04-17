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
import { OrderDialogComponent } from './order-dialog/order-dialog.component';

// Interfaces
interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

interface Order {
  id: number;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOMO';
  paymentStatus: 'PAID' | 'UNPAID';
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

interface OrderStats {
  pending: number;
  confirmed: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}

@Component({
  selector: 'app-orders',
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
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'customer', 'products', 'totalAmount', 'paymentMethod', 'status', 'actions'];
  orders = new MatTableDataSource<Order>();
  orderStats: OrderStats = {
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit() {
    this.orders.paginator = this.paginator;
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Get payment method name
  getPaymentMethodName(method: string): string {
    switch (method) {
      case 'CASH': return 'Tiền mặt';
      case 'CREDIT_CARD': return 'Thẻ tín dụng';
      case 'BANK_TRANSFER': return 'Chuyển khoản';
      case 'MOMO': return 'Ví MoMo';
      default: return method;
    }
  }

  // Get status name
  getStatusName(status: string): string {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang vận chuyển';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  }

  // Calculate order stats
  calculateOrderStats(): void {
    this.orderStats = {
      pending: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0
    };

    this.orders.data.forEach(order => {
      switch (order.status) {
        case 'PENDING': this.orderStats.pending++; break;
        case 'CONFIRMED': this.orderStats.confirmed++; break;
        case 'SHIPPING': this.orderStats.shipping++; break;
        case 'DELIVERED': this.orderStats.delivered++; break;
        case 'CANCELLED': this.orderStats.cancelled++; break;
      }
    });
  }

  // Mock dữ liệu đơn hàng - trong thực tế sẽ được lấy từ API
  loadOrders(): void {
    const mockOrders: Order[] = [
      {
        id: 1001,
        customer: {
          id: 1,
          fullName: 'Nguyễn Văn A',
          phone: '0901234567',
          email: 'nguyenvana@example.com',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
        },
        items: [
          {
            id: 1,
            product: {
              id: 1,
              name: 'iPhone 15 Pro',
              imageUrl: 'assets/images/iphone-15-pro.jpg',
              price: 25000000
            },
            quantity: 1,
            price: 25000000
          },
          {
            id: 2,
            product: {
              id: 5,
              name: 'Tai nghe AirPods Pro',
              imageUrl: 'assets/images/airpods-pro.jpg',
              price: 5900000
            },
            quantity: 1,
            price: 5900000
          }
        ],
        totalAmount: 30900000,
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
        status: 'DELIVERED',
        createdAt: new Date('2025-04-01T10:30:00'),
        updatedAt: new Date('2025-04-03T15:20:00'),
        notes: 'Giao hàng giờ hành chính'
      },
      {
        id: 1002,
        customer: {
          id: 2,
          fullName: 'Trần Thị B',
          phone: '0912345678',
          email: 'tranthib@example.com',
          address: '456 Lê Lợi, Quận 3, TP.HCM'
        },
        items: [
          {
            id: 3,
            product: {
              id: 2,
              name: 'Samsung Galaxy S24',
              imageUrl: 'assets/images/samsung-s24.jpg',
              price: 22000000
            },
            quantity: 1,
            price: 22000000
          }
        ],
        totalAmount: 22000000,
        paymentMethod: 'CASH',
        paymentStatus: 'UNPAID',
        status: 'SHIPPING',
        createdAt: new Date('2025-04-13T14:20:00'),
        updatedAt: new Date('2025-04-14T09:15:00')
      },
      {
        id: 1003,
        customer: {
          id: 3,
          fullName: 'Lê Văn C',
          phone: '0923456789',
          email: 'levanc@example.com',
          address: '789 Nguyễn Trãi, Quận 5, TP.HCM'
        },
        items: [
          {
            id: 4,
            product: {
              id: 3,
              name: 'MacBook Air M3',
              imageUrl: 'assets/images/macbook-air.jpg',
              price: 30000000
            },
            quantity: 1,
            price: 30000000
          },
          {
            id: 5,
            product: {
              id: 6,
              name: 'Magic Mouse',
              imageUrl: 'assets/images/magic-mouse.jpg',
              price: 2500000
            },
            quantity: 1,
            price: 2500000
          },
          {
            id: 6,
            product: {
              id: 7,
              name: 'Magic Keyboard',
              imageUrl: 'assets/images/magic-keyboard.jpg',
              price: 3500000
            },
            quantity: 1,
            price: 3500000
          }
        ],
        totalAmount: 36000000,
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        createdAt: new Date('2025-04-14T09:45:00'),
        updatedAt: new Date('2025-04-14T11:30:00')
      },
      {
        id: 1004,
        customer: {
          id: 4,
          fullName: 'Phạm Thị D',
          phone: '0934567890',
          email: 'phamthid@example.com',
          address: '101 Cách Mạng Tháng 8, Quận 10, TP.HCM'
        },
        items: [
          {
            id: 7,
            product: {
              id: 8,
              name: 'iPad Pro 11"',
              imageUrl: 'assets/images/ipad-pro.jpg',
              price: 20000000
            },
            quantity: 1,
            price: 20000000
          }
        ],
        totalAmount: 20000000,
        paymentMethod: 'MOMO',
        paymentStatus: 'PAID',
        status: 'PENDING',
        createdAt: new Date('2025-04-15T16:20:00'),
        updatedAt: new Date('2025-04-15T16:20:00')
      },
      {
        id: 1005,
        customer: {
          id: 5,
          fullName: 'Hoàng Văn E',
          phone: '0945678901',
          email: 'hoangvane@example.com',
          address: '202 Hai Bà Trưng, Quận 1, TP.HCM'
        },
        items: [
          {
            id: 8,
            product: {
              id: 4,
              name: 'Dell XPS 13',
              imageUrl: 'assets/images/dell-xps-13.jpg',
              price: 35000000
            },
            quantity: 1,
            price: 35000000
          }
        ],
        totalAmount: 35000000,
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
        status: 'CANCELLED',
        createdAt: new Date('2025-04-10T11:15:00'),
        updatedAt: new Date('2025-04-10T14:30:00'),
        notes: 'Khách hàng đổi ý'
      },
      {
        id: 1006,
        customer: {
          id: 6,
          fullName: 'Vũ Thị F',
          phone: '0956789012',
          email: 'vuthif@example.com',
          address: '303 Lý Thường Kiệt, Quận 11, TP.HCM'
        },
        items: [
          {
            id: 9,
            product: {
              id: 9,
              name: 'Tai nghe Sony WH-1000XM5',
              imageUrl: 'assets/images/sony-headphones.jpg',
              price: 8000000
            },
            quantity: 1,
            price: 8000000
          },
          {
            id: 10,
            product: {
              id: 10,
              name: 'Loa Sony SRS-XB23',
              imageUrl: 'assets/images/sony-speaker.jpg',
              price: 2300000
            },
            quantity: 1,
            price: 2300000
          }
        ],
        totalAmount: 10300000,
        paymentMethod: 'CASH',
        paymentStatus: 'UNPAID',
        status: 'CONFIRMED',
        createdAt: new Date('2025-04-15T09:00:00'),
        updatedAt: new Date('2025-04-15T10:45:00')
      }
    ];

    this.orders.data = mockOrders;
    this.calculateOrderStats();
  }

  // Mở dialog tạo đơn hàng mới
  openOrderDialog(order?: Order): void {
    const dialogRef = this.dialog.open(OrderDialogComponent, {
      width: '1000px',
      data: {
        order: order,
        products: [
          { id: 1, name: 'iPhone 15 Pro', price: 25000000 },
          { id: 2, name: 'Samsung Galaxy S24', price: 22000000 },
          { id: 3, name: 'MacBook Air M3', price: 30000000 },
          { id: 4, name: 'Dell XPS 13', price: 35000000 },
          { id: 5, name: 'Tai nghe AirPods Pro', price: 5900000 },
          { id: 6, name: 'Magic Mouse', price: 2500000 },
          { id: 7, name: 'Magic Keyboard', price: 3500000 },
          { id: 8, name: 'iPad Pro 11"', price: 20000000 },
          { id: 9, name: 'Tai nghe Sony WH-1000XM5', price: 8000000 },
          { id: 10, name: 'Loa Sony SRS-XB23', price: 2300000 }
        ],
        customers: [
          { id: 1, name: 'Nguyễn Văn A', phone: '0901234567' },
          { id: 2, name: 'Trần Thị B', phone: '0912345678' },
          { id: 3, name: 'Lê Văn C', phone: '0923456789' },
          { id: 4, name: 'Phạm Thị D', phone: '0934567890' },
          { id: 5, name: 'Hoàng Văn E', phone: '0945678901' },
          { id: 6, name: 'Vũ Thị F', phone: '0956789012' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification(
          order ? 'Cập nhật đơn hàng thành công' : 'Tạo đơn hàng thành công',
          'success'
        );
        this.loadOrders(); // Refresh dữ liệu
      }
    });
  }

  // Xem chi tiết đơn hàng
  viewOrderDetail(id: number): void {
    const order = this.orders.data.find(item => item.id === id);
    if (order) {
      this.dialog.open(OrderDialogComponent, {
        width: '1000px',
        data: {
          order: order,
          viewOnly: true
        }
      });
    }
  }

  // Cập nhật trạng thái đơn hàng
  updateStatus(id: number, status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'): void {
    // Trong thực tế, sẽ gọi API để cập nhật
    const updatedOrders = this.orders.data.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: status,
          updatedAt: new Date()
        };
      }
      return item;
    });

    this.orders.data = updatedOrders;
    this.calculateOrderStats();

    const statusText = this.getStatusName(status);
    this.showNotification(`Đơn hàng #${id} đã được chuyển sang trạng thái ${statusText}`, 'success');
  }

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus(id: number, status: 'PAID' | 'UNPAID'): void {
    // Trong thực tế, sẽ gọi API để cập nhật
    const updatedOrders = this.orders.data.map(item => {
      if (item.id === id) {
        return {
          ...item,
          paymentStatus: status,
          updatedAt: new Date()
        };
      }
      return item;
    });

    this.orders.data = updatedOrders;

    const statusText = status === 'PAID' ? 'đã thanh toán' : 'chưa thanh toán';
    this.showNotification(`Đơn hàng #${id} đã được chuyển sang trạng thái ${statusText}`, 'success');
  }

  // In đơn hàng
  printOrder(id: number): void {
    // Trong thực tế, sẽ gọi API để in hoặc xuất PDF
    console.log(`In đơn hàng ID: ${id}`);
    this.showNotification('Đang chuẩn bị in đơn hàng', 'info');
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }
}