import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatStepperModule,
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  registerError = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      agreeTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator để kiểm tra confirmPassword khớp với password
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.registerError = '';

    // Lấy dữ liệu từ form, loại bỏ confirmPassword và agreeTerms
    const { confirmPassword, agreeTerms, ...registerData } = this.registerForm.value;

    console.log('Register payload:', registerData);

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        // Đăng ký thành công, chuyển hướng sang trang đăng nhập
        this.router.navigate(['/login'], { queryParams: { registered: 'success' } });
      },
      error: (err) => {
        this.isLoading = false;
        this.registerError = err?.error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      }
    });
  }

  getNameErrorMessage(): string {
    const control = this.registerForm.get('name');
    if (control?.hasError('required')) {
      return 'Họ tên không được để trống';
    }
    return control?.hasError('minlength') ? 'Họ tên phải có ít nhất 3 ký tự' : '';
  }

  getEmailErrorMessage(): string {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email không được để trống';
    }
    return emailControl?.hasError('email') ? 'Email không hợp lệ' : '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Mật khẩu không được để trống';
    }
    return passwordControl?.hasError('minlength')
      ? 'Mật khẩu phải có ít nhất 6 ký tự'
      : '';
  }

  getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'Vui lòng xác nhận mật khẩu';
    }
    return confirmPasswordControl?.hasError('passwordMismatch')
      ? 'Mật khẩu xác nhận không khớp'
      : '';
  }

  getPhoneErrorMessage(): string {
    const phoneControl = this.registerForm.get('phoneNumber');
    return phoneControl?.hasError('pattern') ? 'Số điện thoại không hợp lệ' : '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}