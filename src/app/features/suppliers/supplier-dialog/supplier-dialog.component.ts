import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  logo: string;
  categories: Category[];
}

interface DialogData {
  supplier?: Supplier;
  categories: Category[];
}

@Component({
  selector: 'app-supplier-dialog',
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
  templateUrl: './supplier-dialog.component.html',
  styleUrl: './supplier-dialog.component.scss'
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
    this.isEditMode = !!this.data.supplier;
    this.initForm();
  }

  initForm(): void {
    this.supplierForm = this.fb.group({
      name: [this.data.supplier?.name || '', Validators.required],
      description: [this.data.supplier?.description || ''],
      email: [this.data.supplier?.email || '', [Validators.required, Validators.email]],
      phone: [this.data.supplier?.phone || '', Validators.required],
      address: [this.data.supplier?.address || '', Validators.required],
      status: [this.data.supplier?.status || 'active', Validators.required],
      logo: [this.data.supplier?.logo || ''],
      categories: [this.data.supplier?.categories.map(c => c.id) || [], Validators.required]
    });
  }

  onSubmit(): void {
    if (this.supplierForm.valid) {
      const formData = this.supplierForm.value;
      const result = {
        ...(this.data.supplier || { id: Math.floor(Math.random() * 1000) + 6 }),
        ...formData,
        categories: this.mapCategories(formData.categories)
      };

      this.dialogRef.close(result);
    }
  }

  mapCategories(categoryIds: number[]): Category[] {
    return categoryIds.map(id => {
      const category = this.data.categories.find(c => c.id === id);
      return { id, name: category?.name || '' };
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}