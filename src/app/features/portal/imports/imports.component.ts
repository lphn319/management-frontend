import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ImportDialogComponent } from './import-dialog/import-dialog.component';
import { Import, ImportDetail } from './models/import.model';
import { ImportRequest } from './models/import.request'; import { ImportService } from './services/import.service';
import { SupplierService } from '../suppliers/services/supplier.service';
import { ProductService } from '../products/services/product.service';
import { EmployeeService } from '../employees/services/employee.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-imports',
  templateUrl: './imports.component.html',
  styleUrls: ['./imports.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ]
})
export class ImportsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'supplier', 'products', 'quantity', 'totalAmount', 'employee', 'status', 'actions'];
  imports = new MatTableDataSource<Import>();

  suppliers: any[] = [];
  products: any[] = [];
  employees: any[] = [];

  isLoading = false;
  error: string | null = null;
  isLoadingMaster = false;

  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  sortActive = 'createdAt';
  sortDirection = 'desc';
  filterStatus: string | null = null;
  filterSupplierId: number | null = null;
  filterSupplier: number | null = null; // Thêm thuộc tính này để khớp với template
  filterParams: any = {};
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private importService: ImportService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.loadMasterData();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.imports.paginator = this.paginator;
    }
  }

  loadMasterData(): void {
    this.isLoadingMaster = true;
    this.error = null;

    // Gọi API lấy đồng thời suppliers, products và employees 
    forkJoin({
      suppliers: this.supplierService.getAll(),
      products: this.productService.getAll(),
      employees: this.employeeService.getAll() // Hoặc bạn có thể dùng getAllEmployees() nếu có
    })
      .pipe(
        finalize(() => this.isLoadingMaster = false)
      )
      .subscribe({
        next: (result) => {
          this.suppliers = result.suppliers;
          this.products = result.products;
          this.employees = result.employees;

          this.loadImports();
        },
        error: (error) => {
          console.error('Lỗi khi tải dữ liệu:', error);
          this.error = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';

          // Tự động tải danh sách đơn nhập hàng dù có lỗi
          this.loadImports();
        }
      });
  }

  loadImports(): void {
    this.isLoading = true;
    this.error = null;

    // Chuẩn bị các tham số lọc
    this.prepareFilterParams();

    this.importService.getImportsPaginated(
      this.pageIndex,
      this.pageSize,
      this.sortActive,
      this.sortDirection,
      this.filterParams
    )
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.imports.data = response.content;
          this.totalItems = response.totalElements;
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách đơn nhập hàng:', error);
          this.error = 'Không thể tải danh sách đơn nhập hàng. Vui lòng thử lại sau.';
        }
      });
  }

  // Chuẩn bị các tham số lọc
  prepareFilterParams(): void {
    this.filterParams = {};

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.filterParams.name = this.searchTerm.trim();
    }

    if (this.filterSupplierId) {
      this.filterParams.supplierId = this.filterSupplierId;
    }

    if (this.filterSupplier) {
      this.filterParams.supplierId = this.filterSupplier;
    }

    if (this.filterStatus) {
      this.filterParams.status = this.filterStatus;
    }
  }

  // Xử lý sự kiện thay đổi trang
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadImports();
  }

  // Xử lý sự kiện sắp xếp
  onSortChange(event: any): void {
    this.sortActive = event.active;
    this.sortDirection = event.direction || 'asc';
    this.loadImports();
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Mở dialog thêm/sửa đơn nhập hàng
  openImportDialog(importData?: Import): void {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      width: '60vw',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        import: importData,
        suppliers: this.suppliers,
        products: this.products,
        employees: this.employees
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        // Chuẩn bị dữ liệu gửi lên API
        const importRequest: ImportRequest = this.prepareImportRequest(result);

        if (result.id) {
          // Cập nhật đơn nhập hàng
          this.importService.update(result.id, importRequest)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: () => {
                this.showNotification('Cập nhật đơn nhập hàng thành công', 'success');
                this.loadImports(); // Refresh dữ liệu
              },
              error: (error) => {
                this.showNotification('Cập nhật đơn nhập hàng thất bại: ' + error.message, 'error');
              }
            });
        } else {
          // Thêm đơn nhập hàng mới
          this.importService.create(importRequest)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: () => {
                this.showNotification('Tạo đơn nhập hàng thành công', 'success');
                this.loadImports(); // Refresh dữ liệu
              },
              error: (error) => {
                this.showNotification('Tạo đơn nhập hàng thất bại: ' + error.message, 'error');
              }
            });
        }
      }
    });
  }

  // Xem chi tiết đơn nhập hàng
  viewImportDetail(id: number): void {
    this.isLoading = true;

    this.importService.getById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (importData) => {
          this.dialog.open(ImportDialogComponent, {
            width: '60vw',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: {
              import: importData,
              suppliers: this.suppliers,
              products: this.products,
              employees: this.employees,
              viewOnly: true
            }
          });
        },
        error: (error) => {
          this.showNotification('Không thể tải thông tin chi tiết đơn nhập hàng', 'error');
        }
      });
  }

  // Cập nhật trạng thái đơn nhập hàng
  updateStatus(id: number, status: 'completed' | 'processing' | 'cancelled'): void {
    if (confirm(`Bạn có chắc chắn muốn chuyển đơn hàng #${id} sang trạng thái ${this.translateStatus(status)}?`)) {
      this.isLoading = true;

      this.importService.updateStatus(id, status)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.showNotification(`Đơn nhập hàng #${id} đã được chuyển sang trạng thái ${this.translateStatus(status)}`, 'success');
            this.loadImports(); // Refresh dữ liệu
          },
          error: (error) => {
            this.showNotification('Cập nhật trạng thái thất bại: ' + error.message, 'error');
          }
        });
    }
  }

  // Xóa đơn nhập hàng
  deleteImport(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa đơn nhập hàng này?')) {
      this.isLoading = true;

      this.importService.delete(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.showNotification('Xóa đơn nhập hàng thành công', 'success');
            this.loadImports(); // Refresh dữ liệu
          },
          error: (error) => {
            this.showNotification('Xóa đơn nhập hàng thất bại: ' + error.message, 'error');
          }
        });
    }
  }

  // In đơn nhập hàng
  printImport(id: number): void {
    // Trong thực tế, sẽ gọi API để in hoặc xuất PDF
    console.log(`In đơn nhập hàng ID: ${id}`);
    this.showNotification('Đang chuẩn bị in đơn nhập hàng', 'info');
  }

  // Chuẩn bị dữ liệu gửi lên API
  prepareImportRequest(formData: any): ImportRequest {
    return {
      supplierId: formData.supplier.id || formData.supplier,
      employeeId: formData.employee.id || formData.employee,
      status: formData.status,
      notes: formData.notes,
      importDetails: formData.products.map((item: any) => ({
        productId: item.product.id || item.product,
        quantity: item.quantity,
        price: item.price
      }))
    };
  }

  // Dịch trạng thái sang tiếng Việt
  translateStatus(status: string): string {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }

  // Xử lý bộ lọc
  applyStatusFilter(status: string | null): void {
    this.filterStatus = status;
    this.pageIndex = 0; // Reset về trang đầu tiên
    this.loadImports();
  }

  // Xử lý bộ lọc supplier
  applySupplierFilter(supplierId: number | null): void {
    this.filterSupplierId = supplierId;
    this.pageIndex = 0; // Reset về trang đầu tiên
    this.loadImports();
  }

  resetFilters(): void {
    this.filterStatus = null;
    this.filterSupplierId = null;
    this.filterSupplier = null;
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadImports();
  }
}