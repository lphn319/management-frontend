import { Component, OnInit, AfterViewInit, NgZone, HostListener, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, AfterViewInit, AfterContentInit {
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef;
  @ViewChild('mainContent') mainContent!: ElementRef;
  @ViewChild(SidebarComponent) sidebarComponent!: SidebarComponent;

  isSidenavOpen = false;
  isMobile = false;
  sidebarReady = false;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    // Kiểm tra kích thước màn hình ngay từ đầu
    this.checkScreenSize();
  }

  ngAfterContentInit(): void {
    // Đảm bảo component đã được khởi tạo đầy đủ
    setTimeout(() => {
      this.checkSidebarLoadState();
    }, 0);
  }

  ngAfterViewInit(): void {
    // Gọi sự kiện để xác nhận sidebar đã tải xong
    setTimeout(() => {
      this.sidebarReady = true;

      // Mở sidebar trên desktop sau khi tải xong
      if (!this.isMobile) {
        this.isSidenavOpen = true;
      }

      // Force một lần render để đảm bảo UI được cập nhật
      this.ngZone.run(() => { });
    }, 100);
  }

  // Hàm kiểm tra trạng thái tải của sidebar
  checkSidebarLoadState() {
    // Force một lần tính toán layout
    if (this.sidebarContainer) {
      this.sidebarContainer.nativeElement.getBoundingClientRect();
    }
  }

  // Lắng nghe sự kiện ready từ sidebar
  onSidebarReady() {
    this.sidebarReady = true;

    // Mở sidebar trên desktop sau khi tải xong
    if (!this.isMobile) {
      setTimeout(() => {
        this.isSidenavOpen = true;
        // Force render lại UI
        this.ngZone.run(() => { });
      }, 50);
    }
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const wasDesktop = !this.isMobile;
    this.isMobile = window.innerWidth < 768;

    // Đóng sidebar trên mobile nếu trước đó là desktop
    if (this.isMobile && wasDesktop && this.sidebarReady) {
      this.isSidenavOpen = false;
    }
  }
}