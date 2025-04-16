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
import { EmployeeDialogComponent } from './employee-dialog/employee-dialog.component';

// Interfaces
interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  department: Department;
  role: Role;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  lastActive: Date;
  avatar?: string;
}

interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  departments: { [key: string]: number };
}

@Component({
  selector: 'app-employees',
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
    MatTableModule
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  displayedColumns: string[] = ['avatar', 'info', 'department', 'role', 'salary', 'status', 'actions'];
  employees = new MatTableDataSource<Employee>();
  employeeStats: EmployeeStats = {
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
    departments: {}
  };

  departments: Department[] = [
    { id: 1, name: 'Quản lý' },
    { id: 2, name: 'Kinh doanh' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Kỹ thuật' },
    { id: 5, name: 'Chăm sóc khách hàng' },
    { id: 6, name: 'Kế toán' },
    { id: 7, name: 'Nhân sự' }
  ];

  roles: Role[] = [
    { id: 1, name: 'Giám đốc', permissions: ['all'] },
    { id: 2, name: 'Quản lý', permissions: ['manage_employees', 'manage_customers', 'manage_orders'] },
    { id: 3, name: 'Nhân viên kinh doanh', permissions: ['view_customers', 'manage_orders'] },
    { id: 4, name: 'Nhân viên kỹ thuật', permissions: ['manage_products', 'view_orders'] },
    { id: 5, name: 'Nhân viên CSKH', permissions: ['view_customers', 'view_orders'] },
    { id: 6, name: 'Kế toán viên', permissions: ['view_orders', 'manage_payments'] },
    { id: 7, name: 'Nhân viên nhân sự', permissions: ['view_employees'] }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    this.employees.paginator = this.paginator;
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Get initials from full name
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // Generate color based on name
  getAvatarColor(name: string): string {
    if (!name) return '#2196f3';
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#607d8b'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Get status text
  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Đang làm việc';
      case 'inactive': return 'Đã nghỉ việc';
      case 'on_leave': return 'Đang nghỉ phép';
      default: return status;
    }
  }

  // Calculate employee statistics
  calculateStats(employees: Employee[]): void {
    this.employeeStats.total = employees.length;
    this.employeeStats.active = employees.filter(e => e.status === 'active').length;
    this.employeeStats.inactive = employees.filter(e => e.status === 'inactive').length;
    this.employeeStats.onLeave = employees.filter(e => e.status === 'on_leave').length;

    // Calculate department stats
    this.employeeStats.departments = {};
    this.departments.forEach(dept => {
      this.employeeStats.departments[dept.name] = employees.filter(e => e.department.id === dept.id).length;
    });
  }

  // Load employees data
  loadEmployees(): void {
    const mockEmployees: Employee[] = [
      {
        id: 1,
        fullName: 'Nguyễn Văn Quản',
        email: 'nvquan@azura.com',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        department: this.departments[0], // Quản lý
        role: this.roles[0], // Giám đốc
        salary: 35000000,
        hireDate: new Date('2022-01-15'),
        status: 'active',
        lastActive: new Date()
      },
      {
        id: 2,
        fullName: 'Trần Thị Hương',
        email: 'tthuong@azura.com',
        phone: '0912345678',
        address: '456 Lê Lợi, Quận 3, TP.HCM',
        department: this.departments[1], // Kinh doanh
        role: this.roles[1], // Quản lý
        salary: 25000000,
        hireDate: new Date('2022-03-22'),
        status: 'active',
        lastActive: new Date()
      },
      {
        id: 3,
        fullName: 'Lê Văn Minh',
        email: 'lvminh@azura.com',
        phone: '0923456789',
        address: '789 Nguyễn Trãi, Quận 5, TP.HCM',
        department: this.departments[3], // Kỹ thuật
        role: this.roles[1], // Quản lý
        salary: 28000000,
        hireDate: new Date('2022-02-05'),
        status: 'active',
        lastActive: new Date()
      },
      {
        id: 4,
        fullName: 'Phạm Thị Lan',
        email: 'ptlan@azura.com',
        phone: '0934567890',
        address: '101 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        department: this.departments[2], // Marketing
        role: this.roles[1], // Quản lý
        salary: 22000000,
        hireDate: new Date('2022-05-10'),
        status: 'active',
        lastActive: new Date()
      },
      {
        id: 5,
        fullName: 'Hoàng Văn Đức',
        email: 'hvduc@azura.com',
        phone: '0945678901',
        address: '202 Hai Bà Trưng, Quận 1, TP.HCM',
        department: this.departments[4], // Chăm sóc khách hàng
        role: this.roles[4], // Nhân viên CSKH
        salary: 15000000,
        hireDate: new Date('2023-02-17'),
        status: 'active',
        lastActive: new Date()
      },
      {
        id: 6,
        fullName: 'Vũ Thị Mai',
        email: 'vtmai@azura.com',
        phone: '0956789012',
        address: '303 Lý Thường Kiệt, Quận 11, TP.HCM',
        department: this.departments[1], // Kinh doanh
        role: this.roles[2], // Nhân viên kinh doanh
        salary: 18000000,
        hireDate: new Date('2023-01-30'),
        status: 'on_leave',
        lastActive: new Date('2025-04-10')
      },
      {
        id: 7,
        fullName: 'Đặng Văn Hiếu',
        email: 'dvhieu@azura.com',
        phone: '0967890123',
        address: '404 Võ Văn Tần, Quận 3, TP.HCM',
        department: this.departments[3], // Kỹ thuật
        role: this.roles[3], // Nhân viên kỹ thuật
        salary: 20000000,
        hireDate: new Date('2022-11-12'),
        status: 'active',
        lastActive: new Date()
      },
      {
        id: 8,
        fullName: 'Mai Thị Hà',
        email: 'mtha@azura.com',
        phone: '0978901234',
        address: '505 Điện Biên Phủ, Bình Thạnh, TP.HCM',
        department: this.departments[5], // Kế toán
        role: this.roles[5], // Kế toán viên
        salary: 17000000,
        hireDate: new Date('2023-04-25'),
        status: 'inactive',
        lastActive: new Date('2025-02-25')
      },
      {
        id: 9,
        fullName: 'Phan Văn Tuấn',
        email: 'pvtuan@azura.com',
        phone: '0989012345',
        address: '606 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
        department: this.departments[3], // Kỹ thuật
        role: this.roles[3], // Nhân viên kỹ thuật
        salary: 19000000,
        hireDate: new Date('2022-09-18'),
        status: 'active',
        lastActive: new Date()
      },
      {
        id: 10,
        fullName: 'Trương Thị Ngọc',
        email: 'ttngoc@azura.com',
        phone: '0990123456',
        address: '707 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
        department: this.departments[6], // Nhân sự
        role: this.roles[6], // Nhân viên nhân sự
        salary: 16000000,
        hireDate: new Date('2023-06-02'),
        status: 'active',
        lastActive: new Date()
      }
    ];

    this.employees.data = mockEmployees;
    this.calculateStats(mockEmployees);
  }

  // Mở dialog thêm/sửa nhân viên
  openEmployeeDialog(employee?: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '800px',
      data: {
        employee: employee,
        departments: this.departments,
        roles: this.roles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification(
          employee ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công',
          'success'
        );
        this.loadEmployees(); // Refresh dữ liệu
      }
    });
  }

  // Xem chi tiết nhân viên
  viewEmployeeDetail(id: number): void {
    const employee = this.employees.data.find(e => e.id === id);
    if (employee) {
      this.dialog.open(EmployeeDialogComponent, {
        width: '800px',
        data: {
          employee: employee,
          departments: this.departments,
          roles: this.roles,
          viewOnly: true
        }
      });
    }
  }

  // Cập nhật trạng thái nhân viên
  updateStatus(id: number, status: 'active' | 'inactive' | 'on_leave'): void {
    // Trong thực tế, sẽ gọi API để cập nhật
    const updatedEmployees = this.employees.data.map(employee => {
      if (employee.id === id) {
        return {
          ...employee,
          status: status,
          lastActive: status === 'active' ? new Date() : employee.lastActive
        };
      }
      return employee;
    });

    this.employees.data = updatedEmployees;
    this.calculateStats(updatedEmployees);

    let statusText = this.getStatusText(status);
    this.showNotification(`Nhân viên đã được cập nhật trạng thái: ${statusText}`, 'success');
  }

  // Xem lịch sử hoạt động của nhân viên
  viewEmployeeHistory(id: number): void {
    // Trong thực tế, sẽ mở dialog hiển thị lịch sử hoạt động
    this.showNotification('Chức năng đang được phát triển', 'info');
  }

  // Xóa nhân viên
  deleteEmployee(id: number): void {
    // Trong thực tế, sẽ gọi API để xóa
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      const employee = this.employees.data.find(e => e.id === id);

      // Kiểm tra xem có phải giám đốc hoặc quản lý không
      if (employee && (employee.role.id === 1 || employee.role.id === 2)) {
        this.showNotification(
          'Không thể xóa nhân viên có vị trí quản lý cấp cao',
          'error'
        );
        return;
      }

      // Filter out the deleted employee
      const updatedEmployees = this.employees.data.filter(employee => employee.id !== id);
      this.employees.data = updatedEmployees;
      this.calculateStats(updatedEmployees);

      this.showNotification('Xóa nhân viên thành công', 'success');
    }
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }

  // Xuất dữ liệu nhân viên
  exportEmployeeData(): void {
    this.showNotification('Đang xuất dữ liệu nhân viên...', 'info');
    // Trong thực tế, sẽ gọi API để xuất dữ liệu
    setTimeout(() => {
      this.showNotification('Xuất dữ liệu thành công', 'success');
    }, 1500);
  }
}