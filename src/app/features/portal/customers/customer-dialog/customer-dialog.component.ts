import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { DialogData } from '../../../../core/models/customer.model';


@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './customer-dialog.component.html',
  styleUrl: './customer-dialog.component.scss'
})
export class CustomerDialogComponent implements OnInit {
  customerForm!: FormGroup;
  isEditMode: boolean = false;
  viewOnly: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.customer;
    this.viewOnly = !!this.data.viewOnly;
    this.initForm();
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      fullName: [this.data.customer?.fullName || '', Validators.required],
      email: [this.data.customer?.email || '', [Validators.required, Validators.email]],
      phone: [this.data.customer?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      address: [this.data.customer?.address || '', Validators.required],
      membership: [this.data.customer?.membership || 'Thường'],
      points: [this.data.customer?.points || 0],
      status: [this.data.customer?.status || 'active'],
      orderCount: [this.data.customer?.orderCount || 0],
      totalSpent: [this.formatCurrency(this.data.customer?.totalSpent || 0)],
      registeredAt: [this.formatDate(this.data.customer?.registeredAt || new Date())]
    });

    // Nếu ở chế độ chỉ xem thì disable form
    if (this.viewOnly) {
      this.customerForm.disable();
    }
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Format date
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Xem đơn hàng của khách hàng
  viewCustomerOrders(): void {
    // Trong thực tế, sẽ điều hướng đến trang đơn hàng với bộ lọc khách hàng
    this.dialogRef.close('view_orders');
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      const formData = this.customerForm.getRawValue(); // Lấy cả các trường disabled

      // Prepare customer data
      const result = {
        ...(this.data.customer || { id: Math.floor(Math.random() * 1000) + 11 }),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        membership: formData.membership,
        points: parseInt(formData.points),
        status: formData.status,
        // Keep existing order data if editing
        orderCount: this.isEditMode ? this.data.customer?.orderCount || 0 : 0,
        totalSpent: this.isEditMode ? this.data.customer?.totalSpent || 0 : 0,
        registeredAt: this.isEditMode ? this.data.customer?.registeredAt || new Date() : new Date()
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}