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
import { ImportDialogComponent } from './import-dialog/import-dialog.component';

// Interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
  phone: string;
  logo: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Import {
  id: number;
  supplier: Supplier;
  products: Product[];
  quantity: number;
  price: number;
  totalAmount: number;
  employee: User;
  status: 'completed' | 'processing' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

@Component({
  selector: 'app-imports',
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
  templateUrl: './imports.component.html',
  styleUrl: './imports.component.scss'
})
export class ImportsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'supplier', 'products', 'quantity', 'totalAmount', 'employee', 'status', 'actions'];
  imports = new MatTableDataSource<Import>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadImports();
  }

  ngAfterViewInit() {
    this.imports.paginator = this.paginator;
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Mock dữ liệu đơn nhập hàng - trong thực tế sẽ được lấy từ API
  loadImports(): void {
    const mockImports: Import[] = [
      {
        id: 10001,
        supplier: {
          id: 1,
          name: 'Samsung Electronics',
          phone: '(+84) 28 3821 9999',
          logo: 'assets/images/samsung-logo.png'
        },
        products: [
          { id: 1, name: 'Samsung Galaxy S21', price: 15000000, quantity: 20 },
          { id: 2, name: 'Samsung Galaxy Tab S7', price: 12000000, quantity: 10 }
        ],
        quantity: 30,
        price: 400000000,
        totalAmount: 400000000,
        employee: {
          id: 1,
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com'
        },
        status: 'completed',
        createdAt: new Date('2025-03-15T10:30:00'),
        updatedAt: new Date('2025-03-15T14:20:00')
      },
      {
        id: 10002,
        supplier: {
          id: 2,
          name: 'Apple Việt Nam',
          phone: '(+84) 24 3974 3838',
          logo: 'assets/images/apple-logo.png'
        },
        products: [
          { id: 3, name: 'iPhone 15 Pro', price: 25000000, quantity: 15 },
          { id: 4, name: 'MacBook Air M3', price: 30000000, quantity: 8 }
        ],
        quantity: 23,
        price: 615000000,
        totalAmount: 615000000,
        employee: {
          id: 2,
          fullName: 'Trần Thị B',
          email: 'tranthib@example.com'
        },
        status: 'processing',
        createdAt: new Date('2025-04-10T09:15:00'),
        updatedAt: new Date('2025-04-10T09:15:00')
      },
      {
        id: 10003,
        supplier: {
          id: 3,
          name: 'Dell Việt Nam',
          phone: '(+84) 28 3997 3888',
          logo: 'assets/images/dell-logo.png'
        },
        products: [
          { id: 5, name: 'Dell XPS 13', price: 35000000, quantity: 5 },
          { id: 6, name: 'Dell Inspiron 15', price: 15000000, quantity: 10 }
        ],
        quantity: 15,
        price: 325000000,
        totalAmount: 325000000,
        employee: {
          id: 1,
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com'
        },
        status: 'completed',
        createdAt: new Date('2025-03-22T14:45:00'),
        updatedAt: new Date('2025-03-22T16:30:00')
      },
      {
        id: 10004,
        supplier: {
          id: 4,
          name: 'Logitech Vietnam',
          phone: '(+84) 28 3821 5555',
          logo: 'assets/images/logitech-logo.png'
        },
        products: [
          { id: 7, name: 'Logitech MX Master 3', price: 2500000, quantity: 20 },
          { id: 8, name: 'Logitech G Pro X', price: 3000000, quantity: 15 }
        ],
        quantity: 35,
        price: 95000000,
        totalAmount: 95000000,
        employee: {
          id: 3,
          fullName: 'Lê Văn C',
          email: 'levanc@example.com'
        },
        status: 'cancelled',
        createdAt: new Date('2025-04-05T10:00:00'),
        updatedAt: new Date('2025-04-05T11:30:00')
      },
      {
        id: 10005,
        supplier: {
          id: 5,
          name: 'Sony Vietnam',
          phone: '(+84) 28 3839 1111',
          logo: 'assets/images/sony-logo.png'
        },
        products: [
          { id: 9, name: 'Sony WH-1000XM5', price: 8000000, quantity: 12 },
          { id: 10, name: 'Sony PlayStation 5', price: 15000000, quantity: 8 }
        ],
        quantity: 20,
        price: 216000000,
        totalAmount: 216000000,
        employee: {
          id: 2,
          fullName: 'Trần Thị B',
          email: 'tranthib@example.com'
        },
        status: 'processing',
        createdAt: new Date('2025-04-12T13:20:00'),
        updatedAt: new Date('2025-04-12T13:20:00')
      }
    ];

    this.imports.data = mockImports;
  }

  // Mở dialog thêm/sửa đơn nhập hàng
  openImportDialog(importData?: Import): void {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      width: '60vw',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        import: importData,
        suppliers: [
          { id: 1, name: 'Samsung Electronics' },
          { id: 2, name: 'Apple Việt Nam' },
          { id: 3, name: 'Dell Việt Nam' },
          { id: 4, name: 'Logitech Vietnam' },
          { id: 5, name: 'Sony Vietnam' }
        ],
        products: [
          { id: 1, name: 'Samsung Galaxy S21', price: 15000000 },
          { id: 2, name: 'Samsung Galaxy Tab S7', price: 12000000 },
          { id: 3, name: 'iPhone 15 Pro', price: 25000000 },
          { id: 4, name: 'MacBook Air M3', price: 30000000 },
          { id: 5, name: 'Dell XPS 13', price: 35000000 },
          { id: 6, name: 'Dell Inspiron 15', price: 15000000 },
          { id: 7, name: 'Logitech MX Master 3', price: 2500000 },
          { id: 8, name: 'Logitech G Pro X', price: 3000000 },
          { id: 9, name: 'Sony WH-1000XM5', price: 8000000 },
          { id: 10, name: 'Sony PlayStation 5', price: 15000000 }
        ],
        employees: [
          { id: 1, name: 'Nguyễn Văn A' },
          { id: 2, name: 'Trần Thị B' },
          { id: 3, name: 'Lê Văn C' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification(
          importData ? 'Cập nhật đơn nhập hàng thành công' : 'Tạo đơn nhập hàng thành công',
          'success'
        );
        this.loadImports(); // Refresh dữ liệu
      }
    });
  }

  // Xem chi tiết đơn nhập hàng
  viewImportDetail(id: number): void {
    const importData = this.imports.data.find(item => item.id === id);
    if (importData) {
      this.dialog.open(ImportDialogComponent, {
        width: '1000px',
        data: {
          import: importData,
          viewOnly: true
        }
      });
    }
  }

  // Cập nhật trạng thái đơn nhập hàng
  updateStatus(id: number, status: 'completed' | 'processing' | 'cancelled'): void {
    // Trong thực tế, sẽ gọi API để cập nhật
    const updatedImports = this.imports.data.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: status,
          updatedAt: new Date()
        };
      }
      return item;
    });

    this.imports.data = updatedImports;

    const statusText = status === 'completed'
      ? 'hoàn thành'
      : status === 'processing'
        ? 'đang xử lý'
        : 'đã hủy';

    this.showNotification(`Đơn nhập hàng #${id} đã được chuyển sang trạng thái ${statusText}`, 'success');
  }

  // In đơn nhập hàng
  printImport(id: number): void {
    // Trong thực tế, sẽ gọi API để in hoặc xuất PDF
    console.log(`In đơn nhập hàng ID: ${id}`);
    this.showNotification('Đang chuẩn bị in đơn nhập hàng', 'info');
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }
}