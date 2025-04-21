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
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Page } from '../../../core/models/page.model';
import { PageEvent } from '@angular/material/paginator';

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

  // Thống kê thương hiệu
  totalBrands: number = 0;
  activeBrands: number = 0;
  inactiveBrands: number = 0;

  // Biến trạng thái tải dữ liệu
  isLoading: boolean = false;
  defaultImagePath: string = 'assets/images/placeholder.jpg';

  // Biến trạng thái tìm kiếm
  searchControl = new FormControl('');
  statusFilter: string | null = null;

  // Biến trạng thái phân trang
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageSize: number = 10;
  pageIndex: number = 0;
  totalItems: number = 0;

  // Sắp xếp thương hiệu
  sortBy: string = 'name';
  sortDirection: string = 'asc';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private brandService: BrandService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Theo dõi thay đổi tìm kiếm với debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.resetPagination();
      this.loadBrandsWithPagination();
    });

    // Tải dữ liệu ban đầu
    this.loadBrandsWithPagination();
    this.loadStatistics();
    this.loadFeaturedBrands();
  }

  ngAfterViewInit() {
    // Nếu có paginator, gắn sự kiện page
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadBrandsWithPagination();
      });
    }
  }

  // Tải danh sách thương hiệu với phân trang
  loadBrandsWithPagination(): void {
    this.isLoading = true;

    this.brandService.getBrandsPaginated(
      this.pageIndex,
      this.pageSize,
      this.sortBy,
      this.sortDirection,
      this.statusFilter || undefined
    )
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(error => {
          console.error('Lỗi khi tải dữ liệu thương hiệu:', error);
          this.showNotification('Không thể tải dữ liệu thương hiệu. Vui lòng thử lại sau.', 'error');
          return [];
        })
      )
      .subscribe((page: Page<Brand>) => {
        if (page) {
          // Cập nhật dữ liệu bảng
          this.brands.data = page.content;
          // Cập nhật thông tin phân trang
          this.totalItems = page.totalElements;

          console.log('Loaded paginated brands:', {
            content: page.content,
            pageIndex: page.number,
            pageSize: page.size,
            totalItems: page.totalElements,
            totalPages: page.totalPages
          });
        } else {
          console.error('Không nhận được dữ liệu phân trang hợp lệ');
          this.showNotification('Lỗi khi nhận dữ liệu từ server', 'error');
        }
      });
  }

  // Reset về trang đầu tiên
  resetPagination(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Tải dữ liệu thống kê
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
        }
      });
  }

  // Tải thương hiệu nổi bật
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
        }
      });
  }

  // Xử lý thay đổi trang
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBrandsWithPagination();
  }

  // Xử lý thay đổi sắp xếp
  onSortChange(sortOption: string): void {
    // Format: 'field_direction'
    const [field, direction] = sortOption.split('_');
    this.sortBy = field;
    this.sortDirection = direction;
    this.resetPagination();
    this.loadBrandsWithPagination();
  }

  // Xử lý thay đổi trạng thái lọc
  applyStatusFilter(status: string | null): void {
    this.statusFilter = status;
    this.resetPagination();
    this.loadBrandsWithPagination();
  }

  // Xóa tất cả bộ lọc
  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter = null;
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    this.resetPagination();
    this.loadBrandsWithPagination();
  }

  // Áp dụng bộ lọc tìm kiếm
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    // Trong trường hợp phân trang ở server side, cần gọi API
    // với tham số tìm kiếm thay vì lọc trên client
    // this.brands.filter = filterValue.trim().toLowerCase();

    this.resetPagination();
    this.loadBrandsWithPagination();
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
              this.loadBrandsWithPagination();
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
              this.loadBrandsWithPagination();
              this.loadStatistics();
            });
        }
      }
    });
  }

  // Cập nhật trạng thái
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
        this.loadBrandsWithPagination();
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
          this.loadBrandsWithPagination();
          this.loadStatistics();
          this.loadFeaturedBrands();
        });
    }
  }

  // Xem sản phẩm của thương hiệu
  viewBrandProducts(id: number): void {
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