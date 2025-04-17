import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface Order {
  id?: number;
  customer: any;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOMO';
  paymentStatus: 'PAID' | 'UNPAID';
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DialogData {
  order?: Order;
  products?: Product[];
  customers?: Customer[];
  viewOnly?: boolean;
}

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule
  ],
  templateUrl: './order-dialog.component.html',
  styleUrl: './order-dialog.component.scss'
})
export class OrderDialogComponent implements OnInit {
  orderForm!: FormGroup;
  isEditMode: boolean = false;
  viewOnly: boolean = false;
  productsMap: Map<number, Product> = new Map();
  customersMap: Map<number, Customer> = new Map();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    // Create maps for products and customers for quick lookup
    if (this.data.products) {
      this.data.products.forEach(product => {
        this.productsMap.set(product.id, product);
      });
    }

    if (this.data.customers) {
      this.data.customers.forEach(customer => {
        this.customersMap.set(customer.id, customer);
      });
    }
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data.order;
    this.viewOnly = !!this.data.viewOnly;
    this.initForm();
  }

  get itemsFormArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get customerInfo(): FormGroup {
    return this.orderForm.get('customerInfo') as FormGroup;
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      customerType: [this.isEditMode || this.viewOnly ? 'existing' : 'new'],
      existingCustomerId: [this.data.order?.customer?.id || ''],
      customerInfo: this.fb.group({
        fullName: [this.data.order?.customer?.fullName || '', Validators.required],
        phone: [this.data.order?.customer?.phone || '', Validators.required],
        email: [this.data.order?.customer?.email || '', [Validators.email]],
        address: [this.data.order?.customer?.address || '', Validators.required]
      }),
      items: this.fb.array([]),
      paymentMethod: [this.data.order?.paymentMethod || 'CASH', Validators.required],
      paymentStatus: [this.data.order?.paymentStatus || 'UNPAID', Validators.required],
      status: [this.data.order?.status || 'PENDING'],
      notes: [this.data.order?.notes || '']
    });

    // Handle customer type changes
    this.orderForm.get('customerType')?.valueChanges.subscribe(value => {
      if (value === 'existing') {
        this.customerInfo.get('fullName')?.disable();
        this.customerInfo.get('phone')?.disable();
        this.customerInfo.get('email')?.disable();
        this.customerInfo.get('address')?.disable();
      } else {
        this.customerInfo.get('fullName')?.enable();
        this.customerInfo.get('phone')?.enable();
        this.customerInfo.get('email')?.enable();
        this.customerInfo.get('address')?.enable();
      }
    });

    // Initialize order items
    if (this.data.order && this.data.order.items && this.data.order.items.length > 0) {
      this.data.order.items.forEach(item => {
        this.addItem(item);
      });
    } else {
      this.addItem();
    }

    // Handle view only mode
    if (this.viewOnly) {
      this.orderForm.disable();
    }

    // Trigger initial state for customer type
    if (this.isEditMode || this.viewOnly) {
      this.orderForm.get('customerType')?.setValue('existing');
      this.onCustomerSelect();
    }
  }

  addItem(item?: any): void {
    const itemForm = this.fb.group({
      productId: [item?.product?.id || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || '', [Validators.required, Validators.min(0)]]
    });

    this.itemsFormArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
  }

  onProductChange(index: number): void {
    const productIdControl = this.itemsFormArray.at(index).get('productId');
    const priceControl = this.itemsFormArray.at(index).get('price');

    if (productIdControl && priceControl && productIdControl.value) {
      const selectedProduct = this.productsMap.get(productIdControl.value);
      if (selectedProduct) {
        priceControl.setValue(selectedProduct.price);
      }
    }

    this.updateItemTotal(index);
  }

  onCustomerSelect(): void {
    const customerId = this.orderForm.get('existingCustomerId')?.value;
    if (customerId) {
      const customer = this.customersMap.get(customerId);
      if (customer) {
        // In a real application, you would fetch the full customer details from the API
        this.customerInfo.patchValue({
          fullName: customer.name,
          phone: customer.phone,
          // Other fields would be filled with actual data from the API
          email: `${customer.name.toLowerCase().replace(/ /g, '.')}@example.com`,
          address: 'Địa chỉ mẫu của khách hàng'
        });
      }
    }
  }

  updateItemTotal(index: number): void {
    // Force form update to recalculate totals
    this.orderForm.updateValueAndValidity();
  }

  calculateItemTotal(item: any): number {
    if (item && item.quantity && item.price) {
      return item.quantity * item.price;
    }
    return 0;
  }

  calculateTotalQuantity(): number {
    let total = 0;
    for (const control of this.itemsFormArray.controls) {
      total += Number(control.get('quantity')?.value || 0);
    }
    return total;
  }

  calculateTotalAmount(): number {
    let total = 0;
    for (const control of this.itemsFormArray.controls) {
      const quantity = Number(control.get('quantity')?.value || 0);
      const price = Number(control.get('price')?.value || 0);
      total += quantity * price;
    }
    return total;
  }

  printOrder(): void {
    // Implement printing logic here
    console.log('Printing order');
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;

      // Prepare items data
      const itemDetails = formValue.items.map((item: any) => {
        const product = this.productsMap.get(item.productId);
        return {
          product: {
            id: item.productId,
            name: product?.name,
            price: item.price,
            imageUrl: 'assets/images/placeholder.jpg'  // In a real app, this would come from the product data
          },
          quantity: item.quantity,
          price: item.price
        };
      });

      // Prepare customer data
      let customer;
      if (formValue.customerType === 'existing') {
        const existingCustomer = this.customersMap.get(formValue.existingCustomerId);
        customer = {
          id: formValue.existingCustomerId,
          fullName: existingCustomer?.name || this.customerInfo.value.fullName,
          phone: existingCustomer?.phone || this.customerInfo.value.phone,
          email: this.customerInfo.value.email,
          address: this.customerInfo.value.address
        };
      } else {
        customer = {
          id: Math.floor(Math.random() * 100) + 7, // Generate a new ID for a new customer
          fullName: this.customerInfo.value.fullName,
          phone: this.customerInfo.value.phone,
          email: this.customerInfo.value.email,
          address: this.customerInfo.value.address
        };
      }

      const result: Order = {
        ...(this.data.order || {}),
        customer: customer,
        items: itemDetails,
        totalAmount: this.calculateTotalAmount(),
        paymentMethod: formValue.paymentMethod,
        paymentStatus: formValue.paymentStatus,
        status: this.isEditMode ? formValue.status : 'PENDING',
        notes: formValue.notes,
        updatedAt: new Date()
      };

      // Add createdAt if it's a new order
      if (!this.isEditMode) {
        result.createdAt = new Date();
        result.id = Math.floor(Math.random() * 100) + 1007;
      }

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}