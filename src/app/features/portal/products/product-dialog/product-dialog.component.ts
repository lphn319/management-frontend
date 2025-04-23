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
import { Product, DialogData } from '../models/product';

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
  previewImage: string | null = null;
  formSubmitted = false;
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.product;
    this.initForm();

    if (this.data.product?.imageUrl) {
      this.previewImage = this.data.product.imageUrl;
    }

    // Theo dõi sự thay đổi URL hình ảnh
    this.productForm.get('imageUrl')?.valueChanges.subscribe(url => {
      if (url && url.trim() !== '') {
        this.previewImage = url;
      } else {
        this.previewImage = null;
      }
    });
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