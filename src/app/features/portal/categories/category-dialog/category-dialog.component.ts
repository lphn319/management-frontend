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
  description: string;
  parentId?: number;
  status: 'active' | 'inactive';
}

interface DialogData {
  category?: any;
  categories: { id: number; name: string }[];
}

@Component({
  selector: 'app-category-dialog',
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
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.category;
    this.initForm();
  }

  initForm(): void {
    // Lấy parent ID nếu có
    let parentId = null;
    if (this.data.category && this.data.category.parent) {
      parentId = this.data.category.parent.id;
    }

    this.categoryForm = this.fb.group({
      name: [this.data.category?.name || '', Validators.required],
      description: [this.data.category?.description || ''],
      parentId: [parentId],
      status: [this.data.category?.status || 'active']
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;

      // Tìm parent cho danh mục
      let parent = null;
      if (formData.parentId) {
        const parentCategory = this.data.categories.find(c => c.id === formData.parentId);
        if (parentCategory) {
          parent = {
            id: parentCategory.id,
            name: parentCategory.name
          };
        }
      }

      const result = {
        ...(this.data.category || { id: Math.floor(Math.random() * 1000) + 11 }),
        name: formData.name,
        description: formData.description,
        parent: parent,
        status: formData.status,
        productCount: this.data.category?.productCount || 0  // Giữ nguyên số lượng sản phẩm hoặc mặc định là 0
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}