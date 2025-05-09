import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { Category, CategoryParent } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category/category.service';
import { finalize, catchError, of, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryRequest } from '../../../core/models/category.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Page } from '../../../core/models/page.model';

@Component({
  selector: 'app-categories',
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
    MatTableModule,
    MatTreeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['name', 'productCount', 'parent', 'status', 'actions'];
  categories = new MatTableDataSource<Category>([]);
  treeControl = new NestedTreeControl<Category>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Category>();
  isLoading: boolean = true;
  defaultImagePath: string = 'assets/images/placeholder.jpg';

  // Thống kê
  totalCategories: number = 0;
  errorMessage: string | null = null;

  // Phân trang
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageIndex: number = 0;
  totalItems: number = 0;

  // Filter controls
  searchControl = new FormControl('');
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  sortBy: string = 'name';
  sortDirection: string = 'asc';

  // Keep original data for filtering
  private originalTreeData: Category[] = [];
  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private categoryService: CategoryService,
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Theo dõi thay đổi tìm kiếm với debounce
    const searchSub = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.resetPagination();
      this.loadCategoriesWithPagination();
    });

    this.subscriptions.push(searchSub);

    // Tải dữ liệu ban đầu
    this.loadCategoriesWithPagination();
    this.loadCategoryTree();
  }

  ngAfterViewInit() {
    // Nếu có paginator, gắn sự kiện page
    if (this.paginator) {
      const paginatorSub = this.paginator.page.subscribe((event: PageEvent) => {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadCategoriesWithPagination();
      });
      this.subscriptions.push(paginatorSub);
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Tải danh sách danh mục với phân trang
  loadCategoriesWithPagination(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Tạo điều kiện lọc từ form search
    const searchText = this.searchControl.value || '';
    const status = this.statusFilter === 'ALL' ? undefined : this.statusFilter;

    this.categoryService.getCategoriesPaginated(
      this.pageIndex,
      this.pageSize,
      this.sortBy,
      this.sortDirection,
      status
    )
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error loading categories:', error);

          if (error.error instanceof ErrorEvent) {
            this.errorMessage = `Network error: ${error.error.message}`;
          } else {
            this.errorMessage = `Server error: ${error.status} ${error.statusText}`;
            if (error.error && error.error.message) {
              this.errorMessage += ` - ${error.error.message}`;
            }
          }

          this.showNotification(
            `Không thể tải dữ liệu danh mục. ${this.errorMessage}`,
            'error'
          );

          return of(null);
        })
      )
      .subscribe((page: Page<Category> | null) => {
        if (page) {
          // Cập nhật dữ liệu bảng
          this.categories.data = this.processCategoriesWithParents(page.content);

          // Cập nhật thông tin phân trang
          this.totalItems = page.totalElements;
          this.totalCategories = page.totalElements;

          console.log('Loaded paginated categories:', {
            content: page.content,
            pageIndex: page.number,
            pageSize: page.size,
            totalItems: page.totalElements,
            totalPages: page.totalPages
          });
        }
      });
  }

  // Tải cấu trúc cây danh mục
  loadCategoryTree(): void {
    this.categoryService.getAll()
      .pipe(
        catchError(error => {
          console.error('Error loading category tree:', error);
          return of([]);
        })
      )
      .subscribe(categories => {
        if (Array.isArray(categories)) {
          // Xây dựng cấu trúc cây
          const treeData = this.buildCategoryTree(categories);

          // Lưu trữ dữ liệu cây gốc
          this.originalTreeData = treeData;

          // Cập nhật nguồn dữ liệu cây
          this.dataSource.data = treeData;

          this.cdr.detectChanges();
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

  // Check if a node has child nodes
  hasChild = (_: number, node: Category): boolean => {
    return !!node.children && Array.isArray(node.children) && node.children.length > 0;
  }

  // Xử lý thay đổi trang
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCategoriesWithPagination();
  }

  // Set status filter
  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter = status;
    this.resetPagination();
    this.loadCategoriesWithPagination();
  }

  // Set sort option
  setSortOption(option: string): void {
    // Format: 'field_direction'
    const [field, direction] = option.split('_');
    this.sortBy = field;
    this.sortDirection = direction;
    this.resetPagination();
    this.loadCategoriesWithPagination();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter = 'ALL';
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    this.resetPagination();
    this.loadCategoriesWithPagination();
  }

  // Build hierarchical tree structure
  buildCategoryTree(categories: Category[]): Category[] {
    // Create a copy of the categories array to avoid modifying the original
    const allCategories = [...categories];

    // Create a map to store categories by ID for faster access
    const categoryMap = new Map<number, Category>();

    // Add all categories to the map
    allCategories.forEach(category => {
      // Ensure each category has an empty children array
      category.children = [];
      categoryMap.set(category.id, category);
    });

    // Array of root categories (no parent)
    const rootCategories: Category[] = [];

    // Build the tree by adding each category to its parent's children
    allCategories.forEach(category => {
      if (category.parentId === null) {
        // This is a root category
        rootCategories.push(category);
      } else {
        // This is a child category, add to parent's children array
        const parentCategory = categoryMap.get(category.parentId);
        if (parentCategory) {
          parentCategory.children?.push(category);
        } else {
          // If parent not found, treat as root category
          console.warn(`Parent category with ID ${category.parentId} not found for category ${category.name}`);
          rootCategories.push(category);
        }
      }
    });

    return rootCategories;
  }

  // Process categories to add parent name
  processCategoriesWithParents(categories: Category[]): CategoryParent[] {
    return categories.map(category => {
      const result: CategoryParent = { ...category };

      if (category.parentId) {
        // Find the parent category
        const parentCategory = categories.find(c => c.id === category.parentId);
        if (parentCategory) {
          result.parentName = parentCategory.name;
        } else {
          result.parentName = 'Unknown';
        }
      } else {
        result.parentName = '—'; // Em dash for root categories (no parent)
      }

      return result;
    });
  }

  // Open dialog to add/edit category
  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: {
        category: category,
        // Filter categories that can be parent
        categories: this.categories.data
          .filter(c => c.parentId === null)  // Only root categories
          .filter(c => c.id !== category?.id) // Exclude itself (can't be its own parent)
          .map(c => ({ id: c.id, name: c.name }))
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // Update category
          const categoryRequest: CategoryRequest = {
            name: result.name,
            description: result.description,
            parentId: result.parentId,
            status: result.status
          };

          this.categoryService.update(result.id, categoryRequest)
            .pipe(
              catchError(error => {
                console.error('Lỗi khi cập nhật danh mục:', error);
                this.showNotification('Không thể cập nhật danh mục', 'error');
                return of(null);
              })
            )
            .subscribe(() => {
              this.showNotification('Cập nhật danh mục thành công', 'success');
              this.loadCategoriesWithPagination();
              this.loadCategoryTree();
            });
        } else {
          // Add new category
          const categoryRequest: CategoryRequest = {
            name: result.name,
            description: result.description,
            parentId: result.parentId,
            status: result.status
          };

          this.categoryService.create(categoryRequest)
            .pipe(
              catchError(error => {
                console.error('Lỗi khi thêm danh mục:', error);
                this.showNotification('Không thể thêm danh mục', 'error');
                return of(null);
              })
            )
            .subscribe(() => {
              this.showNotification('Thêm danh mục thành công', 'success');
              this.loadCategoriesWithPagination();
              this.loadCategoryTree();
            });
        }
      }
    });
  }

  // Update category status
  updateStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): void {
    this.categoryService.updateStatus(id, status)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi cập nhật trạng thái:', error);
          this.showNotification('Không thể cập nhật trạng thái danh mục', 'error');
          return of(null);
        })
      )
      .subscribe(() => {
        const statusText = status === 'ACTIVE' ? 'hiện' : 'ẩn';
        this.showNotification(`Danh mục đã được ${statusText}`, 'success');
        this.loadCategoriesWithPagination();
        this.loadCategoryTree();
      });
  }

  // Delete category
  deleteCategory(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      // Check if the category has products
      const category = this.categories.data.find(cat => cat.id === id);
      if (category && category.productCount > 0) {
        this.showNotification(
          `Không thể xóa danh mục có ${category.productCount} sản phẩm`,
          'error'
        );
        return;
      }

      // Check if the category has children
      const hasChildren = this.categories.data.some(cat => cat.parentId === id);
      if (hasChildren) {
        this.showNotification(
          'Không thể xóa danh mục có danh mục con',
          'error'
        );
        return;
      }

      this.categoryService.delete(id)
        .pipe(
          catchError(error => {
            console.error('Lỗi khi xóa danh mục:', error);
            this.showNotification('Không thể xóa danh mục', 'error');
            return of(null);
          })
        )
        .subscribe(() => {
          this.showNotification('Xóa danh mục thành công', 'success');
          this.loadCategoriesWithPagination();
          this.loadCategoryTree();
        });
    }
  }

  // View products in category
  viewCategoryProducts(id: number): void {
    console.log(`Xem sản phẩm của danh mục ID: ${id}`);
    this.showNotification('Chuyển hướng đến trang sản phẩm', 'info');
  }

  // Show notification
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }
}