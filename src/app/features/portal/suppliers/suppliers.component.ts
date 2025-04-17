import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { SupplierDialogComponent } from './supplier-dialog/supplier-dialog.component';

// Interface cho nhà cung cấp
interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  logo: string;
  categories: Category[];
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit {
  displayedColumns: string[] = ['logo', 'name', 'email', 'phone', 'address', 'status', 'categories', 'actions'];
  suppliers = new MatTableDataSource<Supplier>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  ngAfterViewInit() {
    this.suppliers.paginator = this.paginator;
  }

  // Mock dữ liệu nhà cung cấp - trong thực tế sẽ được lấy từ API
  loadSuppliers(): void {
    const mockSuppliers: Supplier[] = [
      {
        id: 1,
        name: 'Samsung Electronics',
        description: 'Nhà cung cấp hàng đầu về thiết bị điện tử và công nghệ',
        email: 'contact@samsung.com',
        phone: '(+84) 28 3821 9999',
        address: 'Tòa nhà Samsung, 53 Lê Đại Hành, Hai Bà Trưng, Hà Nội',
        status: 'active',
        logo: 'assets/images/samsung-logo.png',
        categories: [
          { id: 1, name: 'Điện thoại' },
          { id: 2, name: 'Laptop' },
          { id: 5, name: 'Phụ kiện' }
        ]
      },
      {
        id: 2,
        name: 'Apple Việt Nam',
        description: 'Đại diện chính thức của Apple tại Việt Nam',
        email: 'info@apple.vn',
        phone: '(+84) 24 3974 3838',
        address: 'Tầng 15, Tòa nhà Capital Place, 29 Liễu Giai, Ba Đình, Hà Nội',
        status: 'active',
        logo: 'assets/images/apple-logo.png',
        categories: [
          { id: 1, name: 'Điện thoại' },
          { id: 2, name: 'Laptop' },
          { id: 4, name: 'Đồng hồ thông minh' }
        ]
      },
      {
        id: 3,
        name: 'Dell Việt Nam',
        description: 'Chuyên cung cấp máy tính, laptop và thiết bị văn phòng',
        email: 'dell@vn.dell.com',
        phone: '(+84) 28 3997 3888',
        address: 'Tầng 6, Tòa nhà Lim Tower, 29-31 Tôn Đức Thắng, Quận 1, TP.HCM',
        status: 'active',
        logo: 'assets/images/dell-logo.png',
        categories: [
          { id: 2, name: 'Laptop' },
          { id: 5, name: 'Phụ kiện' }
        ]
      },
      {
        id: 4,
        name: 'Logitech Vietnam',
        description: 'Nhà cung cấp phụ kiện máy tính và thiết bị ngoại vi',
        email: 'info@logitech.vn',
        phone: '(+84) 28 3821 5555',
        address: 'Tầng 8, Tòa nhà Bitexco, 19-25 Nguyễn Huệ, Quận 1, TP.HCM',
        status: 'inactive',
        logo: 'assets/images/logitech-logo.png',
        categories: [
          { id: 3, name: 'Tai nghe' },
          { id: 5, name: 'Phụ kiện' }
        ]
      },
      {
        id: 5,
        name: 'Sony Vietnam',
        description: 'Nhà phân phối chính thức sản phẩm âm thanh và hình ảnh Sony',
        email: 'support@sony.com.vn',
        phone: '(+84) 28 3839 1111',
        address: 'Tầng 4, Tòa nhà Exchange Tower, 1 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM',
        status: 'active',
        logo: 'assets/images/sony-logo.png',
        categories: [
          { id: 3, name: 'Tai nghe' },
          { id: 5, name: 'Phụ kiện' }
        ]
      }
    ];

    this.suppliers.data = mockSuppliers;
  }

  // Mở dialog thêm/sửa nhà cung cấp
  openSupplierDialog(supplier?: Supplier): void {
    const dialogRef = this.dialog.open(SupplierDialogComponent, {
      width: '800px',
      data: {
        supplier: supplier,
        categories: [
          { id: 1, name: 'Điện thoại' },
          { id: 2, name: 'Laptop' },
          { id: 3, name: 'Tai nghe' },
          { id: 4, name: 'Đồng hồ thông minh' },
          { id: 5, name: 'Phụ kiện' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification(
          supplier ? 'Cập nhật nhà cung cấp thành công' : 'Thêm nhà cung cấp thành công',
          'success'
        );
        this.loadSuppliers(); // Refresh dữ liệu
      }
    });
  }

  // Xóa nhà cung cấp
  deleteSupplier(id: number): void {
    // Trong thực tế, sẽ gọi API để xóa
    if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      // Filter out the deleted supplier
      this.suppliers.data = this.suppliers.data.filter(supplier => supplier.id !== id);
      this.showNotification('Xóa nhà cung cấp thành công', 'success');
    }
  }

  // Xem sản phẩm của nhà cung cấp
  viewSupplierProducts(id: number): void {
    // Trong thực tế, sẽ điều hướng đến trang sản phẩm của nhà cung cấp
    console.log(`Xem sản phẩm của nhà cung cấp ID: ${id}`);
    this.showNotification('Tính năng đang được phát triển', 'info');
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }
}