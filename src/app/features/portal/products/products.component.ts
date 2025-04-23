import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { Product, ProductRequest } from './models/product';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductService } from './services/product.service';
import { BrandService } from '../brands/services/brand.service';
import { CategoryService } from '../categories/services/category.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, forkJoin } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-product',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipSet,
    MatChip,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    NgClass,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['imageUrl', 'name', 'price', 'quantity', 'brand', 'categories', 'actions'];

  dataSource = new MatTableDataSource<Product>([]);
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchTerm: string = '';
  filterBrand: number | null = null;
  filterCategory: number | null = null;
  filterStock: string | null = null;

  brands: any[] = [];
  categories: any[] = [];
  isLoadingMaster = false;

  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  sortActive = 'createdAt';
  sortDirection = 'asc';
  filterParams: any = {};

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadMasterData();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadMasterData(): void {
    this.isLoadingMaster = true;
    this.error = null;

    // Gọi API lấy đồng thời thương hiệu và danh mục 
    forkJoin({
      brands: this.brandService.getAll(),
      categories: this.categoryService.getProcessedCategories()
    })
      .pipe(
        finalize(() => this.isLoadingMaster = false)
      )
      .subscribe({
        next: (result) => {
          this.brands = result.brands;
          this.categories = result.categories;

          this.loadProducts();
        },
        error: (error) => {
          console.error('Lỗi khi tải dữ liệu danh mục và thương hiệu:', error);
          this.error = 'Không thể tải dữ liệu danh mục và thương hiệu. Vui lòng thử lại sau.';

          this.loadProducts();
        }
      });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    // Sử dụng API phân trang nếu available, nếu không thì fallback về getAll
    if (this.productService.getProductsPaginated) {
      // Chuẩn bị tham số lọc
      this.prepareFilterParams();

      // Gọi API với phân trang
      this.productService.getProductsPaginated(
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
            this.products = response.content;
            this.dataSource.data = response.content;
            this.totalItems = response.totalElements;

            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          },
          error: (error) => {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
            this.error = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.';
            // Fallback để lấy tất cả sản phẩm nếu API phân trang lỗi
            this.loadAllProducts();
          }
        });
    } else {
      // Sử dụng getAll nếu không có phương thức phân trang
      this.loadAllProducts();
    }
  }

  loadAllProducts(): void {
    this.productService.getAll()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (products) => {
          this.products = products;
          this.dataSource.data = products;
          this.applyFilter(); // Áp dụng lọc client-side

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách sản phẩm:', error);
          this.error = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.';
        }
      });
  }

  // Chuẩn bị tham số lọc cho API
  prepareFilterParams(): void {
    this.filterParams = {};

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.filterParams.name = this.searchTerm.trim();
    }

    if (this.filterBrand) {
      this.filterParams.brandId = this.filterBrand;
    }

    if (this.filterCategory) {
      this.filterParams.categoryId = this.filterCategory;
    }

    if (this.filterStock) {
      switch (this.filterStock) {
        case 'inStock':
          this.filterParams.inStock = true;
          break;
        case 'outOfStock':
          this.filterParams.inStock = false;
          break;
        case 'lowStock':
          this.filterParams.inStock = true;
          // Có thể cần thêm logic ở backend để hỗ trợ "sắp hết hàng"
          break;
      }
    }
  }

  /// Áp dụng bộ lọc client-side
  applyFilter(): void {
    this.dataSource.filterPredicate = (data: Product, filter: string): boolean => {
      const matchSearch = !this.searchTerm ||
        data.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (data.description && data.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchBrand = !this.filterBrand || data.brand.id === this.filterBrand;

      const matchCategory = !this.filterCategory ||
        data.categories.some(category => category.id === this.filterCategory);

      let matchStock = true;
      if (this.filterStock) {
        switch (this.filterStock) {
          case 'inStock':
            matchStock = data.quantity > 0;
            break;
          case 'outOfStock':
            matchStock = data.quantity === 0;
            break;
          case 'lowStock':
            matchStock = data.quantity > 0 && data.quantity <= 10;
            break;
          default:
            matchStock = true;
            break;
        }
      }

      return Boolean(matchSearch && matchBrand && matchCategory && matchStock);
    };

    this.dataSource.filter = 'trigger';
  }

  // Xử lý sự kiện thay đổi trang
  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  // Xử lý sự kiện sắp xếp
  onSortChange(event: any): void {
    this.sortActive = event.active;
    this.sortDirection = event.direction || 'asc';
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterBrand = null;
    this.filterCategory = null;
    this.filterStock = null;

    if (typeof this.productService.getProductsPaginated === 'function') {
      // Nếu dùng server-side filtering, load lại sản phẩm
      this.pageIndex = 0;
      this.loadProducts();
    } else {
      // Nếu dùng client-side filtering, chỉ reset filter
      this.dataSource.filter = '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '700px',
      data: {
        product: product ? { ...product } : null,
        brands: this.brands,
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // Cập nhật sản phẩm đã tồn tại
          this.isLoading = true;
          const productRequest = this.mapToProductRequest(result);

          this.productService.update(result.id, productRequest)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: (updatedProduct) => {
                // Tải lại danh sách sản phẩm để cập nhật UI
                this.loadProducts();
                this.snackBar.open('Cập nhật sản phẩm thành công', 'Đóng', { duration: 3000 });
              },
              error: (error) => {
                console.error('Lỗi khi cập nhật sản phẩm:', error);
                this.snackBar.open('Cập nhật sản phẩm thất bại', 'Đóng', { duration: 3000 });
              }
            });
        } else {
          // Thêm sản phẩm mới
          this.isLoading = true;
          const productRequest = this.mapToProductRequest(result);

          this.productService.create(productRequest)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
              next: (newProduct) => {
                // Tải lại danh sách sản phẩm để cập nhật UI
                this.loadProducts();
                this.snackBar.open('Thêm sản phẩm thành công', 'Đóng', { duration: 3000 });
              },
              error: (error) => {
                console.error('Lỗi khi thêm sản phẩm:', error);
                this.snackBar.open('Thêm sản phẩm thất bại', 'Đóng', { duration: 3000 });
              }
            });
        }
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.isLoading = true;

      this.productService.delete(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            // Tải lại danh sách sản phẩm để cập nhật UI
            this.loadProducts();
            this.snackBar.open('Xóa sản phẩm thành công', 'Đóng', { duration: 3000 });
          },
          error: (error) => {
            console.error('Lỗi khi xóa sản phẩm:', error);
            this.snackBar.open('Xóa sản phẩm thất bại', 'Đóng', { duration: 3000 });
          }
        });
    }
  }

  mapToProductRequest(product: Product): ProductRequest {
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      imageUrl: product.imageUrl,
      brandId: product.brand.id,
      categoryIds: product.categories.map(category => category.id)
    };
  }

  exportData(): void {
    console.log('Xuất dữ liệu sản phẩm');
  }
}