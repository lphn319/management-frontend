import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
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
import { Category, CategoryParent } from './models/category.model';
import { CategoryService } from './services/category.service';
import { finalize, catchError, of, Subscription } from 'rxjs';
import { CategoryRequest } from './models/category.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  categories = new MatTableDataSource<Category>();
  treeControl = new NestedTreeControl<Category>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Category>();
  isLoading: boolean = true; // Start with loading to true
  defaultImagePath: string = 'assets/images/placeholder.jpg';
  totalCategories: number = 0;
  filteredCategoriesCount: number = 0;
  errorMessage: string | null = null;
  paginatorInitialized: boolean = false;

  // Filter controls
  searchControl = new FormControl('');
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  sortBy: string = 'name_asc';

  // Keep original data for filtering
  private originalData: CategoryParent[] = [];
  // Keep original tree data
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
    // Load categories
    this.loadCategories();

    // Add listener for search control
    const searchSub = this.searchControl.valueChanges.subscribe(value => {
      this.applyFilter();
    });
    this.subscriptions.push(searchSub);
  }

  ngAfterViewInit() {
    // Log initial rendering state
    console.log('ngAfterViewInit - initial conditions:', {
      isLoading: this.isLoading,
      errorMessage: this.errorMessage,
      paginatorExists: !!this.paginator
    });

    // First attempt to initialize paginator
    this.setupPaginator();

    // Monitor for paginator availability with a delay
    setTimeout(() => {
      if (!this.paginatorInitialized && !this.isLoading) {
        console.log('Attempting delayed paginator initialization');
        this.setupPaginator();

        if (!this.paginator) {
          console.warn('Paginator still not available after timeout');
          // Check if the paginator element exists in the DOM
          const paginatorElement = document.querySelector('mat-paginator');
          console.log('Paginator element in DOM:', !!paginatorElement);

          if (paginatorElement) {
            console.log('Paginator element exists but ViewChild failed to capture it');
          }
        }
      }
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Set up paginator for data source
   * This method can be called both from ngAfterViewInit and when data finishes loading
   */
  setupPaginator(): void {
    if (this.paginator && this.categories) {
      console.log('Setting up paginator');
      this.categories.paginator = this.paginator;
      this.paginatorInitialized = true;

      // If we already have data, update paginator
      if (this.categories.data.length > 0) {
        this.paginator.length = this.categories.data.length;
        // Trigger a page event to update the paginator UI
        this.paginator.page.next({
          pageIndex: this.paginator.pageIndex,
          pageSize: this.paginator.pageSize,
          length: this.categories.data.length
        });
        console.log('Updated paginator with data length:', this.categories.data.length);
      }
    } else {
      console.warn('Cannot set up paginator - missing paginator or categories datasource');
    }
  }

  // Check if a node has child nodes
  hasChild = (_: number, node: Category): boolean => {
    return !!node.children && Array.isArray(node.children) && node.children.length > 0;
  }

  // Apply filter based on search text, status, and sort
  applyFilter(): void {
    const searchText = (this.searchControl.value || '').trim().toLowerCase();

    // Only filter table data, not tree data
    if (this.originalData.length > 0) {
      let filteredData = [...this.originalData];

      // Apply search text filter
      if (searchText) {
        filteredData = filteredData.filter(category =>
          category.name.toLowerCase().includes(searchText) ||
          (category.description && category.description.toLowerCase().includes(searchText))
        );
      }

      // Apply status filter
      if (this.statusFilter !== 'ALL') {
        filteredData = filteredData.filter(category => category.status === this.statusFilter);
      }

      // Apply sorting
      filteredData = this.sortCategories(filteredData, this.sortBy);

      // Update table data
      this.categories.data = filteredData;

      // Re-attach the paginator after changing the data
      if (this.paginator) {
        this.categories.paginator = this.paginator;
      }

      // Update filtered categories count
      this.filteredCategoriesCount = filteredData.length;
    }
  }

  // Filter tree to show only branches containing visible nodes
  filterTreeByVisibleNodes(nodes: Category[], visibleIds: Set<number>): Category[] {
    return nodes.filter(node => {
      // Check if the current node is visible
      const isNodeVisible = visibleIds.has(node.id);

      // Filter children recursively
      if (node.children && node.children.length) {
        const filteredChildren = this.filterTreeByVisibleNodes(node.children, visibleIds);

        // Update node's children with filtered result
        node.children = filteredChildren;

        // Node is visible if it has visible children or it's visible itself
        return filteredChildren.length > 0 || isNodeVisible;
      }

      // Leaf node is visible only if it's in the visible IDs set
      return isNodeVisible;
    });
  }

  // Set status filter
  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter = status;
    this.applyFilter();
  }

  // Set sort option
  setSortOption(option: string): void {
    this.sortBy = option;
    this.applyFilter();
  }

  // Sort categories based on sort option
  sortCategories(categories: CategoryParent[], sortOption: string): CategoryParent[] {
    switch (sortOption) {
      case 'name_asc':
        return [...categories].sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return [...categories].sort((a, b) => b.name.localeCompare(a.name));
      case 'products_desc':
        return [...categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
      case 'products_asc':
        return [...categories].sort((a, b) => (a.productCount || 0) - (b.productCount || 0));
      default:
        return categories;
    }
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;

    console.log('Starting to load categories...');

    this.categoryService.getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Categories loading completed, isLoading set to false');

          // Try to set up paginator again after data is loaded
          // This is critical for conditional rendering
          setTimeout(() => {
            this.setupPaginator();
            this.cdr.detectChanges();
          }, 0);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error loading categories:', error);

          // Detailed error logging
          if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            this.errorMessage = `Network error: ${error.error.message}`;
          } else {
            // Backend returned an unsuccessful response code
            this.errorMessage = `Server error: ${error.status} ${error.statusText}`;
            if (error.error && error.error.message) {
              this.errorMessage += ` - ${error.error.message}`;
            }
          }

          this.showNotification(
            `Không thể tải dữ liệu danh mục. ${this.errorMessage}`,
            'error'
          );

          // Return empty array as fallback data
          return of([]);
        })
      )
      .subscribe(data => {
        console.log('Categories data received:', data);

        if (Array.isArray(data)) {
          // Process the data to add parent name to each category
          const processedData = this.processCategoriesWithParents(data);

          // Store original data for filtering
          this.originalData = processedData;

          // Apply filter if there are any active filters
          if (this.searchControl.value || this.statusFilter !== 'ALL' || this.sortBy !== 'name_asc') {
            this.applyFilter();
          } else {
            // Otherwise show all
            this.categories.data = processedData;

            // Setup paginator after data is loaded
            this.setupPaginator();
          }

          this.totalCategories = data.length;
          this.filteredCategoriesCount = processedData.length;

          // Build hierarchical tree structure
          const treeData = this.buildCategoryTree(data);
          console.log('Tree structure:', treeData);

          // Store original tree data
          this.originalTreeData = treeData;

          // Update data source for tree
          this.dataSource.data = treeData;

          // Force change detection after data changes
          this.cdr.detectChanges();

          if (data.length === 0) {
            console.warn('API returned an empty array for categories');
            this.showNotification('Không có danh mục nào được tìm thấy', 'info');
          }
        } else {
          console.error('Data is not an array:', data);
          this.errorMessage = 'Định dạng dữ liệu không đúng';
          this.showNotification('Định dạng dữ liệu không đúng', 'error');
        }
      });
  }

  // Clear all filters
  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter = 'ALL';
    this.sortBy = 'name_asc';

    // Reset to the first page when clearing filters
    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.applyFilter();
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

    console.log('Root categories after building tree:', rootCategories);
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

  // Get the name of a parent category from its ID
  getParentName(parentId: number | null): string {
    if (!parentId) return '—';

    const parentCategory = this.categories.data.find(c => c.id === parentId);
    return parentCategory ? parentCategory.name : 'Unknown';
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
              this.loadCategories();
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
              this.loadCategories();
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
        this.loadCategories();
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
          this.loadCategories();
        });
    }
  }

  // View products in category
  viewCategoryProducts(id: number): void {
    // In reality, would navigate to products page with category filter
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