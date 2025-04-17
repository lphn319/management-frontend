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
import { MatTreeModule } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';

// Interface for category
interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  parent?: Category;
  children?: Category[];
  status: 'active' | 'inactive';
}

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
    MatTreeModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'productCount', 'parent', 'status', 'actions'];
  categories = new MatTableDataSource<Category>();
  treeControl = new NestedTreeControl<Category>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Category>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit() {
    this.categories.paginator = this.paginator;
  }

  // Check if a node has child nodes
  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;

  // Mock dữ liệu danh mục - trong thực tế sẽ được lấy từ API
  loadCategories(): void {
    // Mock data for the table view
    const allCategories: Category[] = [
      {
        id: 1,
        name: 'Điện thoại',
        description: 'Các loại điện thoại di động',
        productCount: 25,
        status: 'active'
      },
      {
        id: 2,
        name: 'Laptop',
        description: 'Các loại máy tính xách tay',
        productCount: 18,
        status: 'active'
      },
      {
        id: 3,
        name: 'Tai nghe',
        description: 'Các loại tai nghe có dây và không dây',
        productCount: 12,
        status: 'active'
      },
      {
        id: 4,
        name: 'Điện thoại iPhone',
        description: 'Điện thoại iPhone của Apple',
        productCount: 10,
        status: 'active',
        parent: {
          id: 1, name: 'Điện thoại', description: '', productCount: 25, status: 'active'
        }
      },
      {
        id: 5,
        name: 'Điện thoại Samsung',
        description: 'Điện thoại Samsung',
        productCount: 8,
        status: 'active',
        parent: { id: 1, name: 'Điện thoại', description: '', productCount: 25, status: 'active' }
      },
      {
        id: 6,
        name: 'Laptop gaming',
        description: 'Laptop dành cho chơi game',
        productCount: 6,
        status: 'active',
        parent: { id: 2, name: 'Laptop', description: '', productCount: 18, status: 'active' }
      },
      {
        id: 7,
        name: 'Laptop văn phòng',
        description: 'Laptop dành cho công việc văn phòng',
        productCount: 12,
        status: 'active',
        parent: { id: 2, name: 'Laptop', description: '', productCount: 18, status: 'active' }
      },
      {
        id: 8,
        name: 'Tai nghe Bluetooth',
        description: 'Tai nghe không dây Bluetooth',
        productCount: 7,
        status: 'active',
        parent: { id: 3, name: 'Tai nghe', description: '', productCount: 12, status: 'active' }
      },
      {
        id: 9,
        name: 'Tai nghe có dây',
        description: 'Tai nghe có dây chuyên dụng',
        productCount: 5,
        status: 'active',
        parent: { id: 3, name: 'Tai nghe', description: '', productCount: 12, status: 'active' }
      },
      {
        id: 10,
        name: 'Phụ kiện',
        description: 'Các phụ kiện điện tử',
        productCount: 30,
        status: 'inactive'
      }
    ];

    this.categories.data = allCategories;

    // Build tree data
    const rootCategories = allCategories.filter(category => !category.parent);

    rootCategories.forEach(rootCategory => {
      rootCategory.children = allCategories.filter(
        child => child.parent && child.parent.id === rootCategory.id
      );
    });

    this.dataSource.data = rootCategories;
  }

  // Mở dialog thêm/sửa danh mục
  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: {
        category: category,
        categories: this.categories.data.filter(c => !c.parent).map(c => ({ id: c.id, name: c.name }))
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification(
          category ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công',
          'success'
        );
        this.loadCategories(); // Refresh dữ liệu
      }
    });
  }

  // Cập nhật trạng thái danh mục
  updateStatus(id: number, status: 'active' | 'inactive'): void {
    // Trong thực tế, sẽ gọi API để cập nhật
    const updatedCategories = this.categories.data.map(category => {
      if (category.id === id) {
        return {
          ...category,
          status: status
        };
      }
      return category;
    });

    this.categories.data = updatedCategories;

    const statusText = status === 'active' ? 'hiện' : 'ẩn';
    this.showNotification(`Danh mục đã được ${statusText}`, 'success');

    // Cập nhật lại tree view
    this.loadCategories();
  }

  // Xóa danh mục
  deleteCategory(id: number): void {
    // Trong thực tế, sẽ gọi API để xóa
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
      const hasChildren = this.categories.data.some(cat => cat.parent && cat.parent.id === id);
      if (hasChildren) {
        this.showNotification(
          'Không thể xóa danh mục có danh mục con',
          'error'
        );
        return;
      }

      // Filter out the deleted category
      this.categories.data = this.categories.data.filter(category => category.id !== id);
      this.showNotification('Xóa danh mục thành công', 'success');

      // Cập nhật lại tree view
      this.loadCategories();
    }
  }

  // Xem sản phẩm trong danh mục
  viewCategoryProducts(id: number): void {
    // Trong thực tế, sẽ điều hướng đến trang sản phẩm với bộ lọc danh mục
    console.log(`Xem sản phẩm của danh mục ID: ${id}`);
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