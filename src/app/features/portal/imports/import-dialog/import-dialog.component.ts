import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ImportDetail } from '../models/import.model';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class ImportDialogComponent implements OnInit {
  importForm!: FormGroup;
  isEditMode: boolean = false;
  viewOnly: boolean = false;
  productsMap: Map<number, any> = new Map();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Tạo map sản phẩm để tra cứu nhanh
    if (this.data.products) {
      this.data.products.forEach((product: any) => {
        this.productsMap.set(product.id, product);
      });
    }
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data.import?.id;
    this.viewOnly = !!this.data.viewOnly;
    this.initForm();
  }

  get productsFormArray(): FormArray {
    return this.importForm.get('products') as FormArray;
  }

  initForm(): void {
    this.importForm = this.fb.group({
      supplier: [this.data.import?.supplier?.id || '', Validators.required],
      employee: [this.data.import?.employee?.id || '', Validators.required],
      status: [this.data.import?.status || 'processing'],
      products: this.fb.array([]),
      notes: [this.data.import?.notes || '']
    });

    // Khởi tạo products
    if (this.data.import && this.data.import.importDetails && this.data.import.importDetails.length > 0) {
      this.data.import.importDetails.forEach((detail: any) => {
        this.addProduct({
          id: detail.product.id,
          quantity: detail.quantity,
          price: detail.price
        });
      });
    } else {
      this.addProduct();
    }

    // Disable form nếu chỉ xem
    if (this.viewOnly) {
      this.importForm.disable();
    }
  }

  addProduct(product?: any): void {
    const productForm = this.fb.group({
      product: [product?.id || '', Validators.required],
      quantity: [product?.quantity || 1, [Validators.required, Validators.min(1)]],
      price: [product?.price || '', [Validators.required, Validators.min(0)]]
    });

    this.productsFormArray.push(productForm);
  }

  removeProduct(index: number): void {
    this.productsFormArray.removeAt(index);
  }

  onProductChange(index: number): void {
    const productControl = this.productsFormArray.at(index).get('product');
    const priceControl = this.productsFormArray.at(index).get('price');

    if (productControl && priceControl && productControl.value) {
      const selectedProduct = this.productsMap.get(Number(productControl.value));
      if (selectedProduct) {
        priceControl.setValue(selectedProduct.price);
      }
    }

    this.updateProductTotal(index);
  }

  updateProductTotal(index: number): void {
    // Force form update to recalculate totals
    this.importForm.updateValueAndValidity();
  }

  calculateProductTotal(product: any): number {
    if (product && product.quantity && product.price) {
      return product.quantity * product.price;
    }
    return 0;
  }

  calculateTotalQuantity(): number {
    let total = 0;
    for (const control of this.productsFormArray.controls) {
      total += Number(control.get('quantity')?.value || 0);
    }
    return total;
  }

  calculateTotalAmount(): number {
    let total = 0;
    for (const control of this.productsFormArray.controls) {
      const quantity = Number(control.get('quantity')?.value || 0);
      const price = Number(control.get('price')?.value || 0);
      total += quantity * price;
    }
    return total;
  }

  printImport(): void {
    // Implement printing logic here
    console.log('Printing import order');
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.importForm.valid) {
      const formValue = this.importForm.value;

      // Prepare product data
      const productDetails = formValue.products.map((p: any) => {
        const product = this.productsMap.get(Number(p.product));
        return {
          id: Number(p.product),
          name: product?.name,
          price: p.price,
          quantity: p.quantity
        };
      });

      // Find supplier and employee objects
      const supplier = this.data.suppliers?.find((s: any) => s.id === Number(formValue.supplier));
      const employee = this.data.employees?.find((e: any) => e.id === Number(formValue.employee));

      const result = {
        ...(this.data.import || {}),
        supplier: {
          id: Number(formValue.supplier),
          // Hỗ trợ cả name và companyName
          name: supplier?.name || supplier?.companyName,
          companyName: supplier?.companyName || supplier?.name
        },
        employee: {
          id: Number(formValue.employee),
          fullName: employee?.fullName || employee?.name,
          name: employee?.name || employee?.fullName
        },
        products: productDetails,
        quantity: this.calculateTotalQuantity(),
        totalAmount: this.calculateTotalAmount(),
        status: formValue.status,
        notes: formValue.notes,
        updatedAt: new Date()
      };

      // Add createdAt if it's a new import
      if (!this.isEditMode) {
        result.createdAt = new Date();
      }

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}