import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { Product } from './models/product';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';


@Component({
  selector: 'app-product',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
  ]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [
    {
      id: 1,
      name: 'Điện thoại Samsung Galaxy S23',
      description: 'Điện thoại cao cấp của Samsung với màn hình Dynamic AMOLED 2X',
      price: 20000000,
      quantity: 15,
      imageUrl: 'https://s.pro.vn/5S9O',
      brand: {
        id: 1,
        name: 'Samsung'
      },
      categories: [
        {
          id: 1,
          name: 'Điện thoại'
        }
      ]
    },
    {
      id: 2,
      name: 'Laptop Dell XPS 15',
      description: 'Laptop mỏng nhẹ, cấu hình mạnh cho công việc sáng tạo',
      price: 40000000,
      quantity: 8,
      imageUrl: 'https://s.pro.vn/5S9O',
      brand: {
        id: 2,
        name: 'Dell'
      },
      categories: [
        {
          id: 2,
          name: 'Laptop'
        }
      ]
    },
    {
      id: 3,
      name: 'Tai nghe AirPods Pro',
      description: 'Tai nghe không dây với tính năng khử tiếng ồn chủ động',
      price: 5000000,
      quantity: 20,
      imageUrl: 'https://s.pro.vn/5S9O',
      brand: {
        id: 3,
        name: 'Apple'
      },
      categories: [
        {
          id: 3,
          name: 'Tai nghe'
        }
      ]
    },
    {
      id: 4,
      name: 'Đồng hồ thông minh Apple Watch',
      description: 'Đồng hồ thông minh với nhiều tính năng theo dõi sức khỏe',
      price: 8000000,
      quantity: 12,
      imageUrl: 'https://s.pro.vn/5S9O',
      brand: {
        id: 3,
        name: 'Apple'
      },
      categories: [
        {
          id: 4,
          name: 'Đồng hồ thông minh'
        }
      ]
    },
    {
      id: 5,
      name: 'Bàn phím cơ Logitech G Pro',
      description: 'Bàn phím cơ chuyên game với đèn RGB',
      price: 2000000,
      quantity: 25,
      imageUrl: 'https://s.pro.vn/5S9O',
      brand: {
        id: 4,
        name: 'Logitech'
      },
      categories: [
        {
          id: 6,
          name: 'Phụ kiện'
        },
        {
          id: 7,
          name: 'Gaming'
        }
      ]
    }
  ];

  displayedColumns: string[] = ['imageUrl', 'name', 'price', 'quantity', 'brand', 'categories', 'actions'];

  brands = [
    { id: 1, name: 'Samsung' },
    { id: 2, name: 'Dell' },
    { id: 3, name: 'Apple' },
    { id: 4, name: 'Logitech' },
    { id: 5, name: 'Asus' }
  ];

  categories = [
    { id: 1, name: 'Điện thoại' },
    { id: 2, name: 'Laptop' },
    { id: 3, name: 'Tai nghe' },
    { id: 4, name: 'Đồng hồ thông minh' },
    { id: 5, name: 'Phụ kiện' },
    { id: 6, name: 'Gaming' }
  ];

  constructor(
    private dialog: MatDialog,
    // private productService: ProductService
  ) { }

  ngOnInit(): void {
    // Trong thực tế sẽ gọi API lấy dữ liệu
    // this.productService.getProducts().subscribe(products => {
    //   this.products = products;
    // });
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
          const index = this.products.findIndex(p => p.id === result.id);
          if (index !== -1) {
            this.products[index] = result;
            this.products = [...this.products]; // Cập nhật reference cho table
          }

          // Trong thực tế sẽ gọi API
          // this.productService.updateProduct(result).subscribe();
        } else {
          // Thêm sản phẩm mới với ID tự động tăng
          const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
          const newProduct = { ...result, id: newId };
          this.products = [newProduct, ...this.products];

          // Trong thực tế sẽ gọi API
          // this.productService.addProduct(result).subscribe(newProduct => {
          //   this.products = [newProduct, ...this.products];
          // });
        }
      }
    });
  }

  deleteProduct(id: number): void {
    // Xử lý xóa sản phẩm
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      // Gọi API xóa sản phẩm ở đây
      this.products = this.products.filter(product => product.id !== id);
    }
  }
}