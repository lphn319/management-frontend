import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { SupplierDialogComponent } from './supplier-dialog/supplier-dialog.component';
import { SupplierService } from './services/supplier.service';
import { Supplier, SupplierRequest, Category } from './models/supplier.model';
import { finalize } from 'rxjs';
import { Page } from '../../../core/models/page.model';
import { CategoryService } from '../categories/services/category.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  imports: [
    CommonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSortModule,],
  styleUrls: ['./suppliers.component.scss'],
  standalone: true
})
export class SuppliersComponent implements OnInit {
  displayedColumns: string[] = ['logo', 'name', 'email', 'phone', 'address', 'status', 'categories', 'actions'];
  suppliers = new MatTableDataSource<Supplier>([]);

  // Thêm các thuộc tính để quản lý phân trang
  supplierPage: Page<Supplier> | null = null;
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  sortBy = 'companyName';
  sortDirection = 'asc';
  searchKeyword = '';

  isLoading = false;
  error: string | null = null;

  // Danh sách danh mục
  categories: Category[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private supplierService: SupplierService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSuppliersPaginated();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.suppliers.paginator = this.paginator;
    }
  }

  // Tải danh sách danh mục
  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách danh mục:', error);
      }
    });
  }

  // Tải danh sách nhà cung cấp phân trang
  loadSuppliersPaginated(): void {
    this.isLoading = true;
    this.error = null;

    this.supplierService.getSuppliersPaginated(
      this.pageIndex,
      this.pageSize,
      this.sortBy,
      this.sortDirection,
      this.searchKeyword
    )
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (page) => {
          this.supplierPage = page;
          this.suppliers.data = page.content;
          this.totalItems = page.totalElements;
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
          this.error = 'Không thể tải danh sách nhà cung cấp. Vui lòng thử lại sau.';
          this.showNotification(this.error, 'error');
        }
      });
  }

  // Xử lý sự kiện thay đổi trang
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSuppliersPaginated();
  }

  // Xử lý sự kiện tìm kiếm
  onSearch(keyword: string): void {
    this.searchKeyword = keyword;
    this.pageIndex = 0; // Reset về trang đầu tiên khi tìm kiếm
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadSuppliersPaginated();
  }

  // Xử lý sự kiện sắp xếp
  onSort(sortEvent: Sort): void {
    this.sortBy = sortEvent.active;
    this.sortDirection = sortEvent.direction || 'asc';
    this.pageIndex = 0; // Reset về trang đầu tiên khi sắp xếp
    this.loadSuppliersPaginated();
  }

  // Mở dialog thêm/sửa nhà cung cấp
  openSupplierDialog(supplier?: Supplier): void {
    const dialogRef = this.dialog.open(SupplierDialogComponent, {
      width: '800px',
      data: {
        supplier: supplier,
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        // Chuẩn bị dữ liệu gửi lên API
        const supplierRequest: SupplierRequest = {
          companyName: result.companyName,
          address: result.address,
          phone: result.phone,
          email: result.email,
          description: result.description,
          logo: result.logo,
          status: result.status,
          categoryIds: result.categories?.map((cat: Category) => cat.id)  // Lấy danh sách ID từ categories
        };

        if (result.id) {
          // Cập nhật nhà cung cấp
          this.supplierService.update(result.id, supplierRequest)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: () => {
                this.showNotification('Cập nhật nhà cung cấp thành công', 'success');
                this.loadSuppliersPaginated(); // Refresh dữ liệu
              },
              error: (error) => {
                this.showNotification('Cập nhật nhà cung cấp thất bại: ' + error.message, 'error');
              }
            });
        } else {
          // Thêm nhà cung cấp mới
          this.supplierService.create(supplierRequest)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: () => {
                this.showNotification('Thêm nhà cung cấp thành công', 'success');
                this.loadSuppliersPaginated(); // Refresh dữ liệu
              },
              error: (error) => {
                this.showNotification('Thêm nhà cung cấp thất bại: ' + error.message, 'error');
              }
            });
        }
      }
    });
  }

  // Cập nhật trạng thái nhà cung cấp
  updateSupplierStatus(supplier: Supplier, newStatus: 'ACTIVE' | 'INACTIVE'): void {
    if (!supplier.id) return;

    this.isLoading = true;
    this.supplierService.updateStatus(supplier.id, newStatus)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.showNotification(`Nhà cung cấp đã được ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'tạm ngưng'}`, 'success');
          supplier.status = newStatus; // Cập nhật UI
          this.loadSuppliersPaginated(); // Refresh dữ liệu
        },
        error: (error) => {
          this.showNotification(`Không thể cập nhật trạng thái: ${error.message}`, 'error');
        }
      });
  }

  // Xóa nhà cung cấp
  deleteSupplier(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      this.isLoading = true;

      this.supplierService.delete(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.showNotification('Xóa nhà cung cấp thành công', 'success');
            this.loadSuppliersPaginated(); // Refresh dữ liệu
          },
          error: (error) => {
            this.showNotification('Xóa nhà cung cấp thất bại: ' + error.message, 'error');
          }
        });
    }
  }

  // Xem sản phẩm của nhà cung cấp
  viewSupplierProducts(id: number): void {
    // Trong thực tế, sẽ điều hướng đến trang sản phẩm của nhà cung cấp
    this.showNotification('Tính năng đang được phát triển', 'info');
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }

  // Helper method để lấy tên danh mục từ ID
  getCategoryNames(categories?: Category[]): string {
    if (!categories || categories.length === 0) {
      return 'Không có';
    }
    return categories.map(cat => cat.name).join(', ');
  }
}