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
import { BrandDialogComponent } from './brand-dialog/brand-dialog.component';
import { Brand } from './models/brand.model';

@Component({
  selector: 'app-brands',
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
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss'
})
export class BrandsComponent implements OnInit {
  displayedColumns: string[] = ['logo', 'name', 'origin', 'website', 'productCount', 'status', 'actions'];
  brands = new MatTableDataSource<Brand>();
  featuredBrands: Brand[] = [];
  totalBrands: number = 0;
  activeBrands: number = 0;
  inactiveBrands: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBrands();
  }

  ngAfterViewInit() {
    this.brands.paginator = this.paginator;
  }

  // Mock dữ liệu thương hiệu - trong thực tế sẽ được lấy từ API
  loadBrands(): void {
    const mockBrands: Brand[] = [
      {
        id: 1,
        name: 'Apple',
        description: 'Công ty công nghệ đa quốc gia của Mỹ chuyên thiết kế, phát triển và bán các sản phẩm điện tử',
        logoUrl: 'assets/images/apple-logo.png',
        origin: 'Mỹ',
        website: 'https://www.apple.com',
        productCount: 32,
        status: 'active'
      },
      {
        id: 2,
        name: 'Samsung',
        description: 'Tập đoàn đa quốc gia của Hàn Quốc, một trong những nhà sản xuất điện tử tiêu dùng lớn nhất thế giới',
        logoUrl: 'assets/images/samsung-logo.png',
        origin: 'Hàn Quốc',
        website: 'https://www.samsung.com',
        productCount: 48,
        status: 'active'
      },
      {
        id: 3,
        name: 'Sony',
        description: 'Tập đoàn đa quốc gia của Nhật Bản chuyên về điện tử tiêu dùng, video game và giải trí',
        logoUrl: 'assets/images/sony-logo.png',
        origin: 'Nhật Bản',
        website: 'https://www.sony.com',
        productCount: 25,
        status: 'active'
      },
      {
        id: 4,
        name: 'Dell',
        description: 'Công ty đa quốc gia của Mỹ phát triển và bán các sản phẩm máy tính và linh kiện liên quan',
        logoUrl: 'assets/images/dell-logo.png',
        origin: 'Mỹ',
        website: 'https://www.dell.com',
        productCount: 21,
        status: 'active'
      },
      {
        id: 5,
        name: 'HP',
        description: 'Công ty công nghệ thông tin đa quốc gia của Mỹ chuyên về máy tính cá nhân, máy in và các giải pháp phần mềm',
        logoUrl: 'assets/images/hp-logo.png',
        origin: 'Mỹ',
        website: 'https://www.hp.com',
        productCount: 18,
        status: 'active'
      },
      {
        id: 6,
        name: 'Logitech',
        description: 'Nhà sản xuất phụ kiện máy tính và thiết bị ngoại vi của Thụy Sĩ',
        logoUrl: 'assets/images/logitech-logo.png',
        origin: 'Thụy Sĩ',
        website: 'https://www.logitech.com',
        productCount: 35,
        status: 'inactive'
      },
      {
        id: 7,
        name: 'Microsoft',
        description: 'Tập đoàn công nghệ đa quốc gia của Mỹ chuyên phát triển phần mềm và thiết bị điện tử',
        logoUrl: 'assets/images/microsoft-logo.png',
        origin: 'Mỹ',
        website: 'https://www.microsoft.com',
        productCount: 15,
        status: 'active'
      },
      {
        id: 8,
        name: 'Xiaomi',
        description: 'Công ty công nghệ của Trung Quốc chuyên thiết kế và sản xuất điện thoại thông minh, thiết bị thông minh và đồ gia dụng',
        logoUrl: 'assets/images/xiaomi-logo.png',
        origin: 'Trung Quốc',
        website: 'https://www.mi.com',
        productCount: 42,
        status: 'active'
      },
      {
        id: 9,
        name: 'Asus',
        description: 'Công ty đa quốc gia của Đài Loan chuyên sản xuất phần cứng máy tính, điện thoại và thiết bị điện tử',
        logoUrl: 'assets/images/asus-logo.png',
        origin: 'Đài Loan',
        website: 'https://www.asus.com',
        productCount: 28,
        status: 'active'
      },
      {
        id: 10,
        name: 'LG',
        description: 'Tập đoàn đa quốc gia của Hàn Quốc chuyên sản xuất đồ điện tử, điện thoại di động và đồ gia dụng',
        logoUrl: 'assets/images/lg-logo.png',
        origin: 'Hàn Quốc',
        website: 'https://www.lg.com',
        productCount: 22,
        status: 'inactive'
      }
    ];

    this.brands.data = mockBrands;

    // Lấy 5 thương hiệu nổi bật (có số sản phẩm nhiều nhất và đang hoạt động)
    this.featuredBrands = mockBrands
      .filter(brand => brand.status === 'active')
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);

    // Tính toán thống kê
    this.totalBrands = mockBrands.length;
    this.activeBrands = mockBrands.filter(brand => brand.status === 'active').length;
    this.inactiveBrands = mockBrands.filter(brand => brand.status === 'inactive').length;
  }

  // Mở dialog thêm/sửa thương hiệu
  openBrandDialog(brand?: Brand): void {
    const dialogRef = this.dialog.open(BrandDialogComponent, {
      width: '600px',
      data: {
        brand: brand
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification(
          brand ? 'Cập nhật thương hiệu thành công' : 'Thêm thương hiệu thành công',
          'success'
        );
        this.loadBrands(); // Refresh dữ liệu
      }
    });
  }

  // Cập nhật trạng thái thương hiệu
  updateStatus(id: number, status: 'active' | 'inactive'): void {
    // Trong thực tế, sẽ gọi API để cập nhật
    const updatedBrands = this.brands.data.map(brand => {
      if (brand.id === id) {
        return {
          ...brand,
          status: status
        };
      }
      return brand;
    });

    this.brands.data = updatedBrands;

    const statusText = status === 'active' ? 'hiện' : 'ẩn';
    this.showNotification(`Thương hiệu đã được ${statusText}`, 'success');

    // Cập nhật lại thống kê và thương hiệu nổi bật
    this.loadBrands();
  }

  // Xóa thương hiệu
  deleteBrand(id: number): void {
    // Trong thực tế, sẽ gọi API để xóa
    if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      // Check if the brand has products
      const brand = this.brands.data.find(b => b.id === id);
      if (brand && brand.productCount > 0) {
        this.showNotification(
          `Không thể xóa thương hiệu có ${brand.productCount} sản phẩm`,
          'error'
        );
        return;
      }

      // Filter out the deleted brand
      this.brands.data = this.brands.data.filter(brand => brand.id !== id);
      this.showNotification('Xóa thương hiệu thành công', 'success');

      // Cập nhật lại thống kê và thương hiệu nổi bật
      this.loadBrands();
    }
  }

  // Xem sản phẩm của thương hiệu
  viewBrandProducts(id: number): void {
    // Trong thực tế, sẽ điều hướng đến trang sản phẩm với bộ lọc thương hiệu
    console.log(`Xem sản phẩm của thương hiệu ID: ${id}`);
    this.showNotification('Chuyển hướng đến trang sản phẩm', 'info');
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }
}