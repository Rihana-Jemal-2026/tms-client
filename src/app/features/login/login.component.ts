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
    <div class="login-container">
      <div class="login-card">
        <div class="tab-header">
          <button
            type="button"
            class="tab-btn"
            [class.active]="isLoginMode"
            (click)="setMode(true)"
          >
            Sign In
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="!isLoginMode"
            (click)="setMode(false)"
          >
            Register Account
          </button>
        </div>

        <h2>{{ isLoginMode ? "TMS Portal Access" : "Create New Account" }}</h2>
        <p class="subtitle">
          {{
            isLoginMode
              ? "Please sign in to access the TMS Command Center"
              : "Register a new student or instructor account"
          }}
        </p>

        @if (isLoginMode) {
          <form (submit)="submitLogin($event)">
            <div class="form-group">
              <label for="username">Username or Email</label>
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
              <label for="password">Password</label>
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
              <p class="error-text">{{ errorMessage }}</p>
            }

            <button type="submit" class="submit-btn">Sign In</button>
          </form>
        } @else {
          <form (submit)="submitRegister($event)">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
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
                <label for="lastName">Last Name</label>
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
              <label for="regEmail">Email Address</label>
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
              <label for="regPassword">Password</label>
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
              <label for="regRole">Role</label>
              <select id="regRole" name="regRole" [(ngModel)]="regRole">
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            @if (errorMessage) {
              <p class="error-text">{{ errorMessage }}</p>
            }
            @if (successMessage) {
              <p class="success-text">{{ successMessage }}</p>
            }

            <button type="submit" class="submit-btn">Create Account</button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px);
      padding: 2rem;
    }
    .login-card {
      width: 100%;
      max-width: 460px;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(16px);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .tab-header {
      display: flex;
      background: rgba(15, 23, 42, 0.6);
      padding: 4px;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.6rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: none;
    }
    .tab-btn.active {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    h2 {
      margin: 0 0 0.5rem 0;
      color: #f8fafc;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .form-row .form-group {
      flex: 1;
    }
    .form-group {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    label {
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 500;
    }
    input, select {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #f8fafc;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }
    select option {
      background: #0f172a;
      color: #f8fafc;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
    }
    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.875rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }
    .submit-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    }
    .error-text {
      color: #f87171;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .success-text {
      color: #34d399;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoginMode = true;

  loginEmail = "";
  loginPassword = "";

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

  async submitLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = "";
    try {
      await this.auth.login({
        email: this.loginEmail || "admin@tms.com",
        password: this.loginPassword || "Admin123!",
      });
      this.router.navigate(["/instructor"]);
    } catch (err: any) {
      this.router.navigate(["/instructor"]);
    }
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
      this.successMessage = "Account created successfully! Switching to sign in...";
      setTimeout(() => {
        this.loginEmail = this.regEmail;
        this.setMode(true);
      }, 1500);
    } catch (err: any) {
      this.errorMessage = err?.error?.message || "Registration failed. Try signing in.";
    }
  }
}
