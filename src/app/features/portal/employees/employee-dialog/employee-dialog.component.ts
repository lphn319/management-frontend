import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';

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

interface DialogData {
  employee?: Employee;
  departments: Department[];
  roles: Role[];
  viewOnly?: boolean;
}

@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrl: './employee-dialog.component.scss'
})
export class EmployeeDialogComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode: boolean = false;
  viewOnly: boolean = false;
  departments: Department[] = [];
  roles: Role[] = [];

  // Permission display
  permissionLabels: { [key: string]: string } = {
    'all': 'Tất cả quyền',
    'view_employees': 'Xem nhân viên',
    'manage_employees': 'Quản lý nhân viên',
    'view_customers': 'Xem khách hàng',
    'manage_customers': 'Quản lý khách hàng',
    'view_orders': 'Xem đơn hàng',
    'manage_orders': 'Quản lý đơn hàng',
    'manage_products': 'Quản lý sản phẩm',
    'manage_payments': 'Quản lý thanh toán'
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.departments = data.departments;
    this.roles = data.roles;
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data.employee;
    this.viewOnly = !!this.data.viewOnly;
    this.initForm();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      fullName: [this.data.employee?.fullName || '', Validators.required],
      email: [this.data.employee?.email || '', [Validators.required, Validators.email]],
      phone: [this.data.employee?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      address: [this.data.employee?.address || '', Validators.required],
      department: [this.data.employee?.department.id || '', Validators.required],
      role: [this.data.employee?.role.id || '', Validators.required],
      salary: [this.data.employee?.salary || 0, [Validators.required, Validators.min(0)]],
      hireDate: [this.data.employee?.hireDate || new Date(), Validators.required],
      status: [this.data.employee?.status || 'active'],
      lastActive: [this.data.employee?.lastActive || new Date()]
    });

    // Nếu ở chế độ chỉ xem thì disable form
    if (this.viewOnly) {
      this.employeeForm.disable();
    }

    // Listen for role change to show permissions
    this.employeeForm.get('role')?.valueChanges.subscribe(roleId => {
      // You can update UI based on role permissions if needed
    });
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Get permissions for selected role
  getSelectedRolePermissions(): string[] {
    const roleId = this.employeeForm.get('role')?.value;
    const selectedRole = this.roles.find(r => r.id === roleId);
    return selectedRole ? selectedRole.permissions : [];
  }

  // Get department by id
  getDepartmentById(id: number): Department | undefined {
    return this.departments.find(d => d.id === id);
  }

  // Get role by id
  getRoleById(id: number): Role | undefined {
    return this.roles.find(r => r.id === id);
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

  // Xem lịch sử hoạt động
  viewActivityHistory(): void {
    this.dialogRef.close('view_history');
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.getRawValue(); // Lấy cả các trường disabled

      // Lấy thông tin department và role từ ID
      const department = this.getDepartmentById(formData.department);
      const role = this.getRoleById(formData.role);

      if (!department || !role) {
        console.error('Department or Role not found');
        return;
      }

      // Prepare employee data
      const result = {
        ...(this.data.employee || { id: Math.floor(Math.random() * 1000) + 11 }),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        department: department,
        role: role,
        salary: formData.salary,
        hireDate: formData.hireDate,
        status: formData.status,
        lastActive: formData.lastActive
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}