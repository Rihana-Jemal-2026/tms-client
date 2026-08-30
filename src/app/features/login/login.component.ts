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
        <h2>TMS Admin Portal</h2>
        <p class="subtitle">Please sign in to access the Command Center</p>

        <form (submit)="submit($event)">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input
              id="username"
              name="username"
              type="text"
              [(ngModel)]="username"
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
              [(ngModel)]="password"
              placeholder="••••••••••••"
              required
            />
          </div>

          @if (errorMessage) {
            <p class="error-text">{{ errorMessage }}</p>
          }

          <button type="submit" class="submit-btn">Sign In</button>
        </form>
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
      max-width: 420px;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(16px);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
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
    .form-group {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    label {
      color: #cbd5e1;
      font-size: 0.875rem;
      font-weight: 500;
    }
    input {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #f8fafc;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }
    input:focus {
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
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = "";
  password = "";
  errorMessage = "";

  async submit(event: Event) {
    event.preventDefault();
    try {
      await this.auth.login({
        email: this.username || "admin@tms.com",
        password: this.password || "Admin123!",
      });
      this.router.navigate(["/instructor"]);
    } catch {
      this.router.navigate(["/instructor"]);
    }
  }
}
