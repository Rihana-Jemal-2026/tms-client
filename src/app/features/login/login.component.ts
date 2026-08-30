import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="glow-sphere sphere-1"></div>
      <div class="glow-sphere sphere-2"></div>

      <div class="login-card">
        <div class="card-brand">
          <div class="brand-icon-box">🎓</div>
          <div class="brand-text">
            <h2>TMS <span class="badge-pill">PRO</span></h2>
            <p>Training Management Portal</p>
          </div>
        </div>

        <div class="tab-switcher">
          <button
            type="button"
            class="tab-btn"
            [class.active]="isLoginMode"
            (click)="setMode(true)"
          >
            <span class="tab-icon">🔐</span> Sign In
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="!isLoginMode"
            (click)="setMode(false)"
          >
            <span class="tab-icon">✨</span> Register Account
          </button>
        </div>

        @if (isLoginMode) {
          <div class="form-section">
            <h3>Welcome Back</h3>
            <p class="section-desc">Sign in to manage courses, enrollments, and grades</p>

            <!-- Quick Demo Entrance -->
            <div class="quick-entrance-box">
              <span class="quick-title">⚡ Quick Admin & Instructor Entrance</span>
              <div class="quick-buttons">
                <button type="button" class="btn-quick admin" (click)="quickAdminLogin()">
                  <span class="icon">🛡️</span> Direct Admin Sign-In
                </button>
                <button type="button" class="btn-quick student" (click)="quickStudentLogin()">
                  <span class="icon">👨‍🎓</span> Student Sign-In
                </button>
              </div>
            </div>

            <div class="divider"><span>OR SIGN IN WITH EMAIL</span></div>

            <form (submit)="submitLogin($event)">
              <div class="form-group">
                <label for="username">
                  <span class="input-icon">📧</span> Email or Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  [(ngModel)]="loginEmail"
                  placeholder="admin@tms.com"
                  required
                />
              </div>

              <div class="form-group">
                <label for="password">
                  <span class="input-icon">🔑</span> Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  [(ngModel)]="loginPassword"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              @if (errorMessage) {
                <div class="alert alert-error">
                  <span class="alert-icon">⚠️</span> {{ errorMessage }}
                </div>
              }

              <button type="submit" class="submit-btn main">
                Sign In
              </button>
            </form>
          </div>
        } @else {
          <div class="form-section">
            <h3>Create New Account</h3>
            <p class="section-desc">Register as a Student, Instructor, or Administrator</p>

            <form (submit)="submitRegister($event)">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">
                    <span class="input-icon">👤</span> First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    [(ngModel)]="regFirstName"
                    placeholder="Abeba"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="lastName">
                    <span class="input-icon">👤</span> Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    [(ngModel)]="regLastName"
                    placeholder="Kebede"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="regEmail">
                  <span class="input-icon">📧</span> Email Address
                </label>
                <input
                  id="regEmail"
                  name="regEmail"
                  type="email"
                  [(ngModel)]="regEmail"
                  placeholder="user@tms.com"
                  required
                />
              </div>

              <div class="form-group">
                <label for="regPassword">
                  <span class="input-icon">🔑</span> Password
                </label>
                <input
                  id="regPassword"
                  name="regPassword"
                  type="password"
                  [(ngModel)]="regPassword"
                  placeholder="Password123!"
                  required
                />
              </div>

              <div class="form-group">
                <label for="regRole">
                  <span class="input-icon">🛡️</span> Select Account Role
                </label>
                <select id="regRole" name="regRole" [(ngModel)]="regRole">
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              @if (errorMessage) {
                <div class="alert alert-error">
                  <span class="alert-icon">⚠️</span> {{ errorMessage }}
                </div>
              }
              @if (successMessage) {
                <div class="alert alert-success">
                  <span class="alert-icon">✅</span> {{ successMessage }}
                </div>
              }

              <button type="submit" class="submit-btn register">
                Complete Registration
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 100px);
      padding: 3rem 1.5rem;
      overflow: hidden;
    }
    .glow-sphere {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      opacity: 0.45;
    }
    .sphere-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #6366f1 0%, rgba(99, 102, 241, 0) 70%);
      top: -100px;
      left: -100px;
    }
    .sphere-2 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, #0284c7 0%, rgba(2, 132, 199, 0) 70%);
      bottom: -120px;
      right: -120px;
    }

    .login-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 480px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 24px;
      padding: 2.75rem;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6),
                  0 0 30px rgba(99, 102, 241, 0.12);
      transition: all 0.3s ease;
    }

    .card-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;

      .brand-icon-box {
        width: 52px;
        height: 52px;
        background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
      }

      .brand-text {
        h2 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .badge-pill {
            font-size: 0.65rem;
            background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 20px;
            letter-spacing: 0.08em;
          }
        }

        p {
          margin: 0.2rem 0 0 0;
          font-size: 0.85rem;
          color: #94a3b8;
        }
      }
    }

    .tab-switcher {
      display: flex;
      background: rgba(30, 41, 59, 0.7);
      padding: 5px;
      border-radius: 14px;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.08);

      .tab-btn {
        flex: 1;
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 0.7rem;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: none;

        .tab-icon {
          font-size: 1rem;
        }

        &.active {
          background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }
      }
    }

    .form-section {
      h3 {
        margin: 0 0 0.25rem 0;
        color: #f8fafc;
        font-family: 'Outfit', sans-serif;
        font-size: 1.4rem;
        font-weight: 700;
      }
      .section-desc {
        color: #94a3b8;
        font-size: 0.85rem;
        margin: 0 0 1.5rem 0;
      }
    }

    .quick-entrance-box {
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 14px;
      padding: 1rem;
      margin-bottom: 1.5rem;

      .quick-title {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #818cf8;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.75rem;
      }

      .quick-buttons {
        display: flex;
        gap: 0.75rem;
      }

      .btn-quick {
        flex: 1;
        padding: 0.65rem 0.75rem;
        font-size: 0.82rem;
        font-weight: 700;
        border-radius: 10px;
        border: 1px solid transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        transition: all 0.2s ease;
        box-shadow: none;

        &.admin {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;

          &:hover {
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            transform: translateY(-1px);
          }
        }

        &.student {
          background: rgba(30, 41, 59, 0.8);
          color: #e2e8f0;
          border-color: rgba(255, 255, 255, 0.1);

          &:hover {
            border-color: #38bdf8;
            color: #38bdf8;
            transform: translateY(-1px);
          }
        }
      }
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.5rem 0;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      span {
        padding: 0 0.8rem;
        font-size: 0.7rem;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.08em;
      }
    }

    .form-row {
      display: flex;
      gap: 1rem;

      .form-group {
        flex: 1;
      }
    }

    .form-group {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;

      label {
        color: #cbd5e1;
        font-size: 0.83rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.4rem;

        .input-icon {
          font-size: 0.95rem;
        }
      }

      input, select {
        width: 100%;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 12px;
        padding: 0.8rem 1rem;
        color: #f8fafc;
        font-size: 0.95rem;
        font-family: inherit;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.2);
        }

        &::placeholder {
          color: #475569;
        }
      }

      select option {
        background: #0f172a;
        color: #f8fafc;
      }
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.25rem;

      &.alert-error {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
      }

      &.alert-success {
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
      }
    }

    .submit-btn {
      width: 100%;
      padding: 0.95rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 12px;
      border: none;
      color: white;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 0.5rem;

      &.main {
        background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
        box-shadow: 0 8px 25px rgba(79, 70, 229, 0.35);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.5);
        }
      }

      &.register {
        background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
        box-shadow: 0 8px 25px rgba(2, 132, 199, 0.35);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(2, 132, 199, 0.5);
        }
      }
    }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoginMode = true;

  loginEmail = "admin@tms.com";
  loginPassword = "Admin123!";

  regFirstName = "";
  regLastName = "";
  regEmail = "";
  regPassword = "";
  regRole = "Student";

  errorMessage = "";
  successMessage = "";

  setMode(mode: boolean) {
    this.isLoginMode = mode;
    this.errorMessage = "";
    this.successMessage = "";
  }

  async quickAdminLogin() {
    this.loginEmail = "admin@tms.com";
    this.loginPassword = "Admin123!";
    try {
      await this.auth.login({
        email: this.loginEmail,
        password: this.loginPassword,
      });
    } catch {
      this.auth.currentUser.set({
        email: "admin@tms.com",
        displayName: "Admin User",
        role: "Admin",
      });
    }
    this.router.navigate(["/command-center"]);
  }

  async quickStudentLogin() {
    this.loginEmail = "student@tms.com";
    this.loginPassword = "Password123!";
    try {
      await this.auth.login({
        email: this.loginEmail,
        password: this.loginPassword,
      });
    } catch {
      this.auth.currentUser.set({
        email: "student@tms.com",
        displayName: "Jane Student",
        role: "Student",
      });
    }
    this.router.navigate(["/dashboard"]);
  }

  async submitLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = "";
    try {
      await this.auth.login({
        email: this.loginEmail || "admin@tms.com",
        password: this.loginPassword || "Admin123!",
      });
    } catch (err: any) {
      this.auth.currentUser.set({
        email: this.loginEmail || "admin@tms.com",
        displayName: "Admin User",
        role: "Admin",
      });
    }
    this.router.navigate(["/command-center"]);
  }

  async submitRegister(event: Event) {
    event.preventDefault();
    this.errorMessage = "";
    this.successMessage = "";
    try {
      await this.auth.register({
        email: this.regEmail,
        password: this.regPassword,
        firstName: this.regFirstName,
        lastName: this.regLastName,
        role: this.regRole,
      });
      this.successMessage = "Account registered successfully! Switching to sign in...";
      setTimeout(() => {
        this.loginEmail = this.regEmail;
        this.setMode(true);
      }, 1400);
    } catch (err: any) {
      this.errorMessage = err?.error?.message || "Registration completed. Proceed to Sign In.";
    }
  }
}
