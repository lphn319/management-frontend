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
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { DialogData } from '../models/employee.model';
import { Department } from '../../departments/models/department.model';
import { Role } from '../../roles/models/role.model';

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
  hidePassword: boolean = true;

  // Ánh xạ tên quyền
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
    this.viewOnly = !!data.viewOnly;
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data.employee;
    this.initForm();
  }

  initForm(): void {
    const passwordValidators = this.isEditMode
      ? [] // Không bắt buộc khi chỉnh sửa
      : [Validators.required, Validators.minLength(6)];

    this.employeeForm = this.fb.group({
      name: [this.data.employee?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.data.employee?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.data.employee?.phoneNumber || '', [Validators.required, Validators.pattern('^(0|\\+84)[0-9]{9}$')]],
      password: ['', passwordValidators],
      dateOfBirth: [this.data.employee?.dateOfBirth || null, Validators.required],
      gender: [this.data.employee?.gender || 'MALE', Validators.required],
      departmentId: [this.getDepartmentIdByName(this.data.employee?.departmentName) || '', Validators.required],
      roleId: [this.getRoleIdByName(this.data.employee?.roleName) || '', Validators.required],
      status: [this.data.employee?.status || 'ACTIVE']
    });

    // Nếu ở chế độ chỉ xem thì disable form
    if (this.viewOnly) {
      this.employeeForm.disable();
    }

    // Lắng nghe thay đổi role để cập nhật danh sách quyền hiển thị
    this.employeeForm.get('roleId')?.valueChanges.subscribe(() => {
      // Có thể thêm logic xử lý khi role thay đổi
    });
  }

  // Lấy ID phòng ban từ tên
  getDepartmentIdByName(name?: string): number | null {
    if (!name) return null;
    const department = this.departments.find(d => d.name === name);
    return department ? department.id : null;
  }

  // Lấy ID vai trò từ tên
  getRoleIdByName(name?: string): number | null {
    if (!name) return null;
    const role = this.roles.find(r => r.name === name);
    return role ? role.id : null;
  }

  // Lấy quyền của vai trò đã chọn
  getSelectedRolePermissions(): string[] {
    const roleId = this.employeeForm.get('roleId')?.value;
    const selectedRole = this.roles.find(r => r.id === roleId);
    return selectedRole ? selectedRole.permissions : [];
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const result = this.employeeForm.value;

      // Nếu không nhập mật khẩu khi cập nhật, xóa trường password
      if (this.isEditMode && !result.password) {
        delete result.password;
      }

      this.dialogRef.close(result);
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.keys(this.employeeForm.controls).forEach(key => {
        const control = this.employeeForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Kiểm tra lỗi form
  getErrorMessage(controlName: string): string {
    const control = this.employeeForm.get(controlName);

    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }

    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Cần tối thiểu ${minLength} ký tự`;
    }

    if (control?.hasError('pattern')) {
      if (controlName === 'phoneNumber') {
        return 'Số điện thoại không hợp lệ (bắt đầu bằng 0 hoặc +84, 10 số)';
      }
      return 'Định dạng không hợp lệ';
    }

    return '';
  }

  // Kiểm tra trạng thái lỗi của trường
  isFieldInvalid(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}