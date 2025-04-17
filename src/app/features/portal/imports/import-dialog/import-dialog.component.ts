import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Supplier {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

interface Import {
  id?: number;
  supplier: any;
  products: any[];
  quantity: number;
  price: number;
  totalAmount: number;
  employee: any;
  status: 'completed' | 'processing' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
}

interface DialogData {
  import?: Import;
  suppliers?: Supplier[];
  products?: Product[];
  employees?: Employee[];
  viewOnly?: boolean;
}

@Component({
  selector: 'app-import-dialog',
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
  templateUrl: './import-dialog.component.html',
  styleUrl: './import-dialog.component.scss'
})
export class ImportDialogComponent implements OnInit {
  importForm!: FormGroup;
  isEditMode: boolean = false;
  viewOnly: boolean = false;
  productsMap: Map<number, Product> = new Map();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    // Create map of products for quick lookup
    if (this.data.products) {
      this.data.products.forEach(product => {
        this.productsMap.set(product.id, product);
      });
    }
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data.import;
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

    // Initialize products
    if (this.data.import && this.data.import.products && this.data.import.products.length > 0) {
      this.data.import.products.forEach(product => {
        this.addProduct(product);
      });
    } else {
      this.addProduct();
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
      const selectedProduct = this.productsMap.get(productControl.value);
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
        const product = this.productsMap.get(p.product);
        return {
          id: p.product,
          name: product?.name,
          price: p.price,
          quantity: p.quantity
        };
      });

      // Find supplier and employee objects
      const supplier = this.data.suppliers?.find(s => s.id === formValue.supplier);
      const employee = this.data.employees?.find(e => e.id === formValue.employee);

      const result: Import = {
        ...(this.data.import || {}),
        supplier: {
          id: formValue.supplier,
          name: supplier?.name
        },
        employee: {
          id: formValue.employee,
          name: employee?.name
        },
        products: productDetails,
        quantity: this.calculateTotalQuantity(),
        price: this.calculateTotalAmount(),
        totalAmount: this.calculateTotalAmount(),
        status: formValue.status,
        notes: formValue.notes,
        updatedAt: new Date()
      };

      // Add createdAt if it's a new import
      if (!this.isEditMode) {
        result.createdAt = new Date();
        result.id = Math.floor(Math.random() * 1000) + 10006;
      }

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}