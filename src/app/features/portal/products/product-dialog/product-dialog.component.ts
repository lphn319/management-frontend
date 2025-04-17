import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../models/product';

export interface DialogData {
  product: Product | null;
  brands: { id: number; name: string }[];
  categories: { id: number; name: string }[];
}

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class ProductDialogComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.product;
    this.initForm();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [this.data.product?.id || null],
      name: [this.data.product?.name || '', [Validators.required]],
      description: [this.data.product?.description || ''],
      price: [this.data.product?.price || 0, [Validators.required, Validators.min(0)]],
      quantity: [this.data.product?.quantity || 0, [Validators.required, Validators.min(0)]],
      imageUrl: [this.data.product?.imageUrl || ''],
      brand: [this.data.product?.brand.id || '', [Validators.required]],
      categories: [this.data.product?.categories.map(c => c.id) || []]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      // Định dạng dữ liệu cho Brand và Categories
      const formattedProduct = {
        ...productData,
        brand: {
          id: productData.brand,
          name: this.data.brands.find(b => b.id === productData.brand)?.name || ''
        },
        categories: productData.categories.map((id: number) => {
          const category = this.data.categories.find(c => c.id === id);
          return {
            id: id,
            name: category?.name || ''
          };
        })
      };

      this.dialogRef.close(formattedProduct);
    }
  }
}