import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Supplier, DialogData, Category } from '../models/supplier.model';

@Component({
  selector: 'app-supplier-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule
  ],
  templateUrl: './supplier-dialog.component.html',
  styleUrls: ['./supplier-dialog.component.scss'],
  standalone: true
})
export class SupplierDialogComponent implements OnInit {
  supplierForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SupplierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.supplier?.id;
    this.initForm();
  }

  initForm(): void {
    this.supplierForm = this.fb.group({
      companyName: [this.data.supplier?.companyName || '', Validators.required],
      description: [this.data.supplier?.description || ''],
      email: [this.data.supplier?.email || '', [Validators.required, Validators.email]],
      phone: [this.data.supplier?.phone || '', Validators.required],
      address: [this.data.supplier?.address || '', Validators.required],
      status: [this.data.supplier?.status || 'ACTIVE', Validators.required],
      logo: [this.data.supplier?.logo || ''],
      categories: [this.extractCategoryIds(this.data.supplier?.categories), Validators.required]
    });
  }

  // Helper để lấy danh sách ID từ categories
  private extractCategoryIds(categories?: Category[]): number[] {
    if (!categories || categories.length === 0) {
      return [];
    }
    return categories.map(c => c.id);
  }

  onSubmit(): void {
    if (this.supplierForm.valid) {
      const formData = this.supplierForm.value;

      // Trả về dữ liệu với định dạng tương thích với model
      const result: Supplier = {
        ...(this.data.supplier || {}),
        id: this.data.supplier?.id || null,
        companyName: formData.companyName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        status: formData.status,
        logo: formData.logo,
        categories: this.mapCategories(formData.categories)
      };

      this.dialogRef.close(result);
    }
  }

  mapCategories(categoryIds: number[]): Category[] {
    if (!categoryIds || categoryIds.length === 0) {
      return [];
    }

    return categoryIds.map(id => {
      const category = this.data.categories?.find(c => c.id === id);
      return { id, name: category?.name || '' };
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}