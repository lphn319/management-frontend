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
import { FormControl } from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { DepartmentService } from '../../../core/services/department/department.service';
import { RoleService } from '../../../core/services/role/role.service';
import { EmployeeDialogComponent } from './employee-dialog/employee-dialog.component';
import { Role } from '../../../core/models/role.model';
import { Employee, EmployeeStats, EmployeeRequest } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/department.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { MatDivider } from '@angular/material/list';

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
    MatTableModule,
    MatProgressSpinner,
    NgIf,
    MatDivider
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  displayedColumns: string[] = ['avatar', 'info', 'department', 'role', 'salary', 'status', 'actions'];
  departmentDisplayedColumns: string[] = ['id', 'name', 'employees', 'actions'];

  employees = new MatTableDataSource<Employee>();
  departmentDataSource = new MatTableDataSource<Department>();

  employeeStats: EmployeeStats = {
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
    departments: {}
  };

  departments: Department[] = [];
  roles: Role[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  searchControl = new FormControl('');
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  departmentFilter: number | 'ALL' = 'ALL';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private roleService: RoleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadInitialData();

    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.employees.paginator = this.paginator;
    } else {
      console.warn('Paginator is not available');
    }
  }

  // Tải dữ liệu ban đầu
  loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    console.log('Bắt đầu tải dữ liệu ban đầu');

    // Tải danh sách phòng ban
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        console.log('Đã tải phòng ban:', departments);
        this.departments = departments;
        this.departmentDataSource.data = departments; // Cập nhật data source cho phòng ban

        // Tải danh sách vai trò
        this.roleService.getAll().subscribe({
          next: (roles) => {
            console.log('Đã tải vai trò:', roles);
            this.roles = roles;

            // Tải danh sách nhân viên
            this.loadEmployees();
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = `Không thể tải danh sách vai trò: ${error.message}`;
            this.showNotification(this.errorMessage, 'error');
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = `Không thể tải danh sách phòng ban: ${error.message}`;
        this.showNotification(this.errorMessage, 'error');
      }
    });
  }

  // Tải danh sách nhân viên
  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = null;

    console.log('Đang tải danh sách nhân viên');

    this.employeeService.getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.paginator && !this.employees.paginator) {
            this.employees.paginator = this.paginator;
          }
        }),
        catchError((error) => {
          this.errorMessage = `Không thể tải danh sách nhân viên: ${error.message}`;
          this.showNotification(this.errorMessage, 'error');
          return of([]);
        })
      )
      .subscribe(employees => {
        console.log('Đã tải nhân viên:', employees);
        this.employees.data = employees;

        // Tính toán thống kê từ dữ liệu nhân viên
        this.calculateStats(employees);
      });

    // Tải thống kê nhân viên (nếu có API riêng)
    this.employeeService.getStatistics()
      .pipe(
        catchError((error) => {
          console.error('Error loading employee statistics:', error);
          return of({
            total: 0,
            active: 0,
            inactive: 0,
            onLeave: 0,
            departments: {}
          });
        })
      )
      .subscribe(stats => {
        console.log('Đã tải thống kê nhân viên:', stats);
        this.employeeStats = stats;
      });
  }

  // Lấy tên phòng ban từ ID
  getDepartmentName(id: number | 'ALL'): string {
    if (id === 'ALL') return 'Tất cả';
    const department = this.departments.find(d => d.id === id);
    return department ? department.name : 'Tất cả';
  }
  // Tính toán thống kê từ danh sách nhân viên
  calculateStats(employees: Employee[]): void {
    this.employeeStats.total = employees.length;
    this.employeeStats.active = employees.filter(e => e.status === 'ACTIVE').length;
    this.employeeStats.inactive = employees.filter(e => e.status === 'INACTIVE').length;

    // Tính toán số nhân viên theo phòng ban
    this.employeeStats.departments = {};
    this.departments.forEach(dept => {
      this.employeeStats.departments[dept.name] = employees.filter(e => e.departmentName === dept.name).length;
    });

    console.log('Thống kê phòng ban:', this.employeeStats.departments);
  }

  // Áp dụng bộ lọc
  applyFilter(): void {
    const searchText = (this.searchControl.value || '').trim().toLowerCase();

    this.employees.filterPredicate = (employee: Employee, filter: string) => {
      // Áp dụng tìm kiếm theo tên, email, số điện thoại
      const matchFilter = !filter ||
        employee.name.toLowerCase().includes(filter) ||
        employee.email.toLowerCase().includes(filter) ||
        employee.phoneNumber.includes(filter);

      // Áp dụng lọc theo trạng thái
      const matchStatus = this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && employee.status === 'ACTIVE') ||
        (this.statusFilter === 'INACTIVE' && employee.status === 'INACTIVE');

      // Áp dụng lọc theo phòng ban
      const matchDepartment = this.departmentFilter === 'ALL' ||
        this.getDepartmentIdByName(employee.departmentName) === this.departmentFilter;

      return matchFilter && matchStatus && matchDepartment;
    };

    this.employees.filter = searchText;

    if (this.employees.paginator) {
      this.employees.paginator.firstPage();
    }
  }

  // Đặt bộ lọc trạng thái
  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter = status;
    this.applyFilter();
  }

  // Đặt bộ lọc phòng ban
  setDepartmentFilter(departmentId: number | 'ALL'): void {
    this.departmentFilter = departmentId;
    this.applyFilter();
  }

  // Xóa bộ lọc
  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter = 'ALL';
    this.departmentFilter = 'ALL';
    this.applyFilter();
  }

  // Format tiền tệ
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Lấy chữ cái đầu từ tên
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // Tạo màu avatar dựa trên tên
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

  // Lấy text trạng thái
  getStatusText(status: string): string {
    return status === 'ACTIVE' ? 'Đang làm việc' : 'Đã nghỉ việc';
  }

  // Lấy ID phòng ban từ tên
  getDepartmentIdByName(name: string): number | null {
    if (!name) return null;
    const department = this.departments.find(d => d.name === name);
    return department ? department.id : null;
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
        if (employee) {
          // Cập nhật nhân viên - bao gồm status
          const employeeRequest: EmployeeRequest = {
            name: result.name,
            email: result.email,
            phoneNumber: result.phoneNumber,
            password: result.password,
            dateOfBirth: result.dateOfBirth,
            gender: result.gender,
            departmentId: result.departmentId,
            roleId: result.roleId,
            status: result.status
          };

          this.employeeService.update(employee.id, employeeRequest)
            .pipe(
              catchError(error => {
                console.error('Lỗi khi cập nhật nhân viên:', error);
                this.showNotification('Không thể cập nhật nhân viên', 'error');
                return of(null);
              })
            )
            .subscribe(updatedEmployee => {
              if (updatedEmployee) {
                this.showNotification('Cập nhật nhân viên thành công', 'success');
                this.loadEmployees();
              }
            });
        } else {
          // Thêm nhân viên mới
          const employeeRequest: EmployeeRequest = {
            name: result.name,
            email: result.email,
            phoneNumber: result.phoneNumber,
            password: result.password,
            dateOfBirth: result.dateOfBirth,
            gender: result.gender,
            departmentId: result.departmentId,
            roleId: result.roleId
          };

          this.employeeService.create(employeeRequest)
            .pipe(
              catchError(error => {
                console.error('Lỗi khi thêm nhân viên:', error);
                this.showNotification('Không thể thêm nhân viên', 'error');
                return of(null);
              })
            )
            .subscribe(newEmployee => {
              if (newEmployee) {
                this.showNotification('Thêm nhân viên thành công', 'success');
                this.loadEmployees();
              }
            });
        }
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
  updateStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): void {
    this.employeeService.updateStatus(id, status)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi cập nhật trạng thái nhân viên:', error);
          this.showNotification('Không thể cập nhật trạng thái nhân viên', 'error');
          return of(null);
        })
      )
      .subscribe(() => {
        const statusText = status === 'ACTIVE' ? 'đang làm việc' : 'đã nghỉ việc';
        this.showNotification(`Nhân viên đã được cập nhật trạng thái: ${statusText}`, 'success');
        this.loadEmployees();
      });
  }

  // Xóa nhân viên
  deleteEmployee(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      // Kiểm tra vai trò của nhân viên
      const employee = this.employees.data.find(e => e.id === id);
      if (employee && employee.roleName === 'ADMIN') {
        this.showNotification('Không thể xóa nhân viên có vai trò Admin', 'error');
        return;
      }

      this.employeeService.delete(id)
        .pipe(
          catchError(error => {
            console.error('Lỗi khi xóa nhân viên:', error);
            this.showNotification('Không thể xóa nhân viên', 'error');
            return of(null);
          })
        )
        .subscribe(() => {
          this.showNotification('Xóa nhân viên thành công', 'success');
          this.loadEmployees();
        });
    }
  }

  // Xuất dữ liệu nhân viên
  exportEmployeeData(): void {
    this.showNotification('Đang xuất dữ liệu nhân viên...', 'info');
    // Trong thực tế, sẽ gọi API để xuất dữ liệu
    setTimeout(() => {
      this.showNotification('Xuất dữ liệu thành công', 'success');
    }, 1500);
  }

  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [`${type}-snackbar`, 'azura-snackbar']
    });
  }
}