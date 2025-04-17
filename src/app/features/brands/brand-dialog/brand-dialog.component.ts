import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Brand, DialogData } from '../models/brand.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Component({
  selector: 'app-brand-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './brand-dialog.component.html',
  styleUrl: './brand-dialog.component.scss'
})
export class BrandDialogComponent implements OnInit {
  brandForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BrandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.brand;
    this.initForm();
  }

  initForm(): void {
    this.brandForm = this.fb.group({
      name: [this.data.brand?.name || '', Validators.required],
      description: [this.data.brand?.description || ''],
      logoUrl: [this.data.brand?.logoUrl || ''],
      origin: [this.data.brand?.origin || '', Validators.required],
      website: [this.data.brand?.website || '', [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      status: [this.data.brand?.status || 'ACTIVE'], // Lưu ý: Thay đổi để phù hợp với enum
      productCount: [this.data.brand?.productCount || 0]
    });

    // Nếu đang chỉnh sửa thì disable trường productCount
    if (this.isEditMode) {
      this.brandForm.get('productCount')?.disable();
    }
  }

  onSubmit(): void {
    if (this.brandForm.valid) {
      const formData = this.brandForm.value;

      const result = {
        ...(this.data.brand || { id: Math.floor(Math.random() * 1000) + 11 }),
        name: formData.name,
        description: formData.description,
        logoUrl: formData.logoUrl || 'assets/images/placeholder.jpg',
        origin: formData.origin,
        website: formData.website,
        status: formData.status,
        productCount: this.isEditMode ? this.data.brand?.productCount : 0
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}