import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatHeaderRow, MatRow, MatHeaderCell, MatCell, MatColumnDef } from '@angular/material/table';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { NgClass } from '@angular/common';

export interface SummaryCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: number;
}

export interface RecentOrder {
  id: number;
  customer: string;
  date: string;
  total: number;
  status: string;
}

export interface TopProduct {
  id: number;
  name: string;
  sold: number;
  revenue: number;
  stock: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTableModule, // Thay thế các import riêng lẻ bằng module đầy đủ
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    NgClass // Thêm NgClass cho [ngClass] trong template
  ]
})
export class DashboardComponent implements OnInit {
  Math = Math; // Để sử dụng trong template

  summaryCards: SummaryCard[] = [
    {
      title: 'Tổng doanh thu',
      value: '125,000,000 ₫',
      icon: 'payments',
      color: '#3f51b5',
      change: 12.5
    },
    {
      title: 'Đơn hàng',
      value: 145,
      icon: 'shopping_cart',
      color: '#f44336',
      change: 5.2
    },
    {
      title: 'Khách hàng',
      value: 87,
      icon: 'people',
      color: '#4caf50',
      change: 3.1
    },
    {
      title: 'Sản phẩm',
      value: 534,
      icon: 'inventory_2',
      color: '#ff9800',
      change: -2.3
    }
  ];

  recentOrders: RecentOrder[] = [
    { id: 5123, customer: 'Nguyễn Văn A', date: '15/04/2025', total: 2500000, status: 'Hoàn thành' },
    { id: 5122, customer: 'Trần Thị B', date: '14/04/2025', total: 1800000, status: 'Đang giao' },
    { id: 5121, customer: 'Lê Văn C', date: '14/04/2025', total: 950000, status: 'Đang giao' },
    { id: 5120, customer: 'Phạm Thị D', date: '13/04/2025', total: 3200000, status: 'Hoàn thành' },
    { id: 5119, customer: 'Hoàng Văn E', date: '12/04/2025', total: 1500000, status: 'Hoàn thành' }
  ];

  topProducts: TopProduct[] = [
    { id: 101, name: 'Điện thoại Samsung Galaxy S23', sold: 35, revenue: 35000000, stock: 15 },
    { id: 203, name: 'Laptop Dell XPS 15', sold: 12, revenue: 28800000, stock: 8 },
    { id: 305, name: 'Tai nghe AirPods Pro', sold: 45, revenue: 13500000, stock: 20 },
    { id: 422, name: 'Đồng hồ thông minh Apple Watch', sold: 28, revenue: 19600000, stock: 12 },
    { id: 510, name: 'Bàn phím cơ Logitech G Pro', sold: 32, revenue: 6400000, stock: 25 }
  ];

  displayedOrderColumns: string[] = ['id', 'customer', 'date', 'total', 'status', 'actions'];
  displayedProductColumns: string[] = ['name', 'sold', 'revenue', 'stock', 'actions'];

  constructor() { }

  ngOnInit(): void {
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
}