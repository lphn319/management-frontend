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
import { BrandService } from './services/brand.service';
import { finalize, catchError } from 'rxjs';
import { BrandRequest } from './models/brand.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, ApiResponseHelper } from '../../../core/models/api-response.model';

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
    MatTableModule,
    MatProgressSpinnerModule
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
  isLoading: boolean = false;
  defaultImagePath: string = 'assets/images/placeholder.jpg';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private brandService: BrandService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadBrands();
    this.loadStatistics();
    this.loadFeaturedBrands();
  }

  ngAfterViewInit() {
    this.brands.paginator = this.paginator;
  }

  // Tải danh sách thương hiệu từ API
  loadBrands(): void {
    this.isLoading = true;
    this.brandService.getAll()
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(error => {
          console.error('Lỗi khi tải dữ liệu thương hiệu:', error);
          this.showNotification('Không thể tải dữ liệu thương hiệu. Vui lòng thử lại sau.', 'error');
          return [];
        })
      )
      .subscribe(data => {
        if (Array.isArray(data)) {
          this.brands.data = data;
          console.log('Loaded brands:', data);
        } else {
          console.error('Dữ liệu không phải là mảng:', data);
          this.showNotification('Định dạng dữ liệu không đúng', 'error');
        }
      });
  }

  // Tải thống kê từ API
  loadStatistics(): void {
    this.brandService.getStatistics()
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải thống kê:', error);
          return [];
        })
      )
      .subscribe(data => {
        if (data) {
          this.totalBrands = data.totalBrands || 0;
          this.activeBrands = data.activeBrands || 0;
          this.inactiveBrands = data.inactiveBrands || 0;
          console.log('Loaded statistics:', data);
        } else {
          console.error('Không có dữ liệu thống kê:', data);
        }
      });
  }

  // Tải thương hiệu nổi bật từ API
  loadFeaturedBrands(): void {
    this.brandService.getFeaturedBrands(5)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải thương hiệu nổi bật:', error);
          return [];
        })
      )
      .subscribe(data => {
        if (Array.isArray(data)) {
          this.featuredBrands = data;
          console.log('Loaded featured brands:', data);
        } else {
          console.error('Dữ liệu thương hiệu nổi bật không phải là mảng:', data);
        }
      });
  }

  // Debug API để kiểm tra trực tiếp phản hồi
  debugApiCall(): void {
    console.log('Calling API directly...');
    this.http.get<ApiResponse<Brand[]>>('http://localhost:8085/api/v1/brands')
      .subscribe({
        next: (response) => console.log('Raw API response:', response),
        error: (error) => console.error('Direct API error:', error)
      });
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
        if (result.id) {
          // Cập nhật thương hiệu
          const brandRequest: BrandRequest = {
            name: result.name,
            description: result.description,
            logoUrl: result.logoUrl,
            origin: result.origin,
            website: result.website,
            status: result.status
          };

          this.brandService.update(result.id, brandRequest)
            .pipe(
              catchError(error => {
                console.error('Lỗi khi cập nhật thương hiệu:', error);
                this.showNotification('Không thể cập nhật thương hiệu', 'error');
                return [];
              })
            )
            .subscribe(() => {
              this.showNotification('Cập nhật thương hiệu thành công', 'success');
              this.loadBrands();
              this.loadStatistics();
              this.loadFeaturedBrands();
            });
        } else {
          // Thêm thương hiệu mới
          const brandRequest: BrandRequest = {
            name: result.name,
            description: result.description,
            logoUrl: result.logoUrl,
            origin: result.origin,
            website: result.website,
            status: result.status
          };

          this.brandService.create(brandRequest)
            .pipe(
              catchError(error => {
                console.error('Lỗi khi thêm thương hiệu:', error);
                this.showNotification('Không thể thêm thương hiệu', 'error');
                return [];
              })
            )
            .subscribe(() => {
              this.showNotification('Thêm thương hiệu thành công', 'success');
              this.loadBrands();
              this.loadStatistics();
            });
        }
      }
    });
  }

  // Cập nhật trạng thái thương hiệu
  updateStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): void {
    this.brandService.updateStatus(id, status)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi cập nhật trạng thái:', error);
          this.showNotification('Không thể cập nhật trạng thái thương hiệu', 'error');
          return [];
        })
      )
      .subscribe(() => {
        const statusText = status === 'ACTIVE' ? 'hiện' : 'ẩn';
        this.showNotification(`Thương hiệu đã được ${statusText}`, 'success');
        this.loadBrands();
        this.loadStatistics();
        this.loadFeaturedBrands();
      });
  }

  // Xóa thương hiệu
  deleteBrand(id: number): void {
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

      this.brandService.delete(id)
        .pipe(
          catchError(error => {
            console.error('Lỗi khi xóa thương hiệu:', error);
            this.showNotification('Không thể xóa thương hiệu', 'error');
            return [];
          })
        )
        .subscribe(() => {
          this.showNotification('Xóa thương hiệu thành công', 'success');
          this.loadBrands();
          this.loadStatistics();
          this.loadFeaturedBrands();
        });
    }
  }

  // Xem sản phẩm của thương hiệu
  viewBrandProducts(id: number): void {
    console.log(`Xem sản phẩm của thương hiệu ID: ${id}`);
    this.showNotification('Chuyển hướng đến trang sản phẩm', 'info');
    // Ví dụ: this.router.navigate(['/products'], { queryParams: { brandId: id } });
  }

  // Tìm kiếm thương hiệu
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.brands.filter = filterValue.trim().toLowerCase();

    if (this.brands.paginator) {
      this.brands.paginator.firstPage();
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