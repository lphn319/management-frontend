import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogData } from '../models/category.model';

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
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode: boolean = false;
  submitAttempted = false;

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
    if (this.data.category && this.data.category.parentId) {
      parentId = this.data.category.parentId;
    }

    this.categoryForm = this.fb.group({
      name: [this.data.category?.name || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      description: [this.data.category?.description || '', [
        Validators.maxLength(500)
      ]],
      parentId: [parentId],
      status: [this.data.category?.status || 'ACTIVE']
    });
  }

  onSubmit(): void {
    this.submitAttempted = true;

    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;

      const result = {
        ...(this.data.category || {}),
        id: this.data.category?.id,
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId,
        status: formData.status,
        productCount: this.data.category?.productCount || 0
      };

      this.dialogRef.close(result);
    } else {
      const formControls = this.categoryForm.controls;
      for (const controlName in formControls) {
        if (formControls[controlName].invalid) {
          const invalidControl = document.querySelector(`[formControlName="${controlName}"]`);
          invalidControl && (invalidControl as HTMLElement).focus();
          break;
        }
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Helper cho việc kiểm tra lỗi
  getErrorMessage(controlName: string): string {
    const control = this.categoryForm.get(controlName);

    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }

    if (control?.hasError('minlength')) {
      return `Cần tối thiểu ${control.getError('minlength').requiredLength} ký tự`;
    }

    if (control?.hasError('maxlength')) {
      return `Không được vượt quá ${control.getError('maxlength').requiredLength} ký tự`;
    }

    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.categoryForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.submitAttempted));
  }
}