import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login-form',
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
    // NgIf
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  loginError = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    // private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    // In a real app, use the regular login method with your API
    //   this.authService.login(this.loginForm.value)
    //   this.authService.loginDemo(this.loginForm.value)
    //     .subscribe({
    //       next: () => {
    //         this.isLoading = false;
    //         this.router.navigate(['/dashboard']);
    //       },
    //       error: (error) => {
    //         this.isLoading = false;
    //         this.loginError = error?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
    //       }
    //     });
    // }

    // getEmailErrorMessage(): string {
    //   const emailControl = this.loginForm.get('email');
    //   if (emailControl?.hasError('required')) {
    //     return 'Email không được để trống';
    //   }
    //   return emailControl?.hasError('email') ? 'Email không hợp lệ' : '';
    // }

    // getPasswordErrorMessage(): string {
    //   const passwordControl = this.loginForm.get('password');
    //   if (passwordControl?.hasError('required')) {
    //     return 'Mật khẩu không được để trống';
    //   }
    //   return passwordControl?.hasError('minlength')
    //     ? 'Mật khẩu phải có ít nhất 6 ký tự'
    //     : '';
    // }

    // togglePasswordVisibility(): void {
    //   this.hidePassword = !this.hidePassword;
    // }
  }
}
