import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoginMode = true;
  isSubmitting = false;
  showPassword = false;
  rememberDevice = true;
  selectedRole: "Student" | "Instructor" | "Admin" = "Student";

  loginEmail = "";
  loginPassword = "";

  regFirstName = "";
  regLastName = "";
  regEmail = "";
  regPassword = "";
  regRole: "Student" | "Instructor" = "Student";

  errorMessage = "";
  successMessage = "";
  isAlreadyRegistered = false;

  get hasMinLength(): boolean {
    return this.regPassword.length >= 12;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.regPassword);
  }

  get hasDigit(): boolean {
    return /[0-9]/.test(this.regPassword);
  }

  get hasSpecialChar(): boolean {
    return /[^a-zA-Z0-9]/.test(this.regPassword);
  }

  get isPasswordValid(): boolean {
    return this.hasMinLength && this.hasUppercase && this.hasDigit && this.hasSpecialChar;
  }

  setMode(mode: boolean, preserveSuccess = false) {
    this.isLoginMode = mode;
    this.errorMessage = "";
    this.isAlreadyRegistered = false;
    if (!preserveSuccess) {
      this.successMessage = "";
    }
  }

  selectRoleTab(role: "Student" | "Instructor" | "Admin") {
    this.selectedRole = role;
    this.errorMessage = "";
    if (role === "Student") {
      this.loginEmail = "abebe@tms.com";
      this.loginPassword = "StudentPass123!";
    } else if (role === "Instructor") {
      this.loginEmail = "instructor@tms.com";
      this.loginPassword = "InstructorPass123!";
    } else if (role === "Admin") {
      this.loginEmail = "admin@tms.com";
      this.loginPassword = "AdminPass123!";
    }
  }

  quickLogin(email: string, pass: string, role: "Student" | "Instructor" | "Admin") {
    this.loginEmail = email;
    this.loginPassword = pass;
    this.selectedRole = role;
    this.errorMessage = "";
  }

  async submitLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = "";
    this.successMessage = "";
    this.isAlreadyRegistered = false;

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = "Please enter both your email address and password.";
      return;
    }

    this.isSubmitting = true;

    try {
      // 1. Authenticate with backend API
      await this.auth.login({
        email: this.loginEmail.trim(),
        password: this.loginPassword,
      });

      const user = this.auth.currentUser();

      // 2. Auto-detect user role from JWT token & update UI tab
      if (user?.role) {
        this.selectedRole = user.role as "Student" | "Instructor" | "Admin";
      }

      this.successMessage = `Welcome back, ${user?.displayName || 'User'}! Directing you to your ${user?.role} portal...`;

      // 3. Navigate directly to dashboard matching role
      if (user?.role === "Admin") {
        await this.router.navigate(["/command-center"]);
      } else if (user?.role === "Instructor") {
        await this.router.navigate(["/instructor"]);
      } else {
        await this.router.navigate(["/dashboard"]);
      }
    } catch (err: any) {
      this.errorMessage =
        err?.error?.detail ||
        err?.error?.message ||
        "Invalid email or password. Please check your credentials and try again.";
    } finally {
      this.isSubmitting = false;
    }
  }

  async submitRegister(event: Event) {
    event.preventDefault();
    this.errorMessage = "";
    this.successMessage = "";
    this.isAlreadyRegistered = false;

    if (!this.regEmail || !this.regPassword || !this.regFirstName || !this.regLastName) {
      this.errorMessage = "Please fill in all required fields (First Name, Last Name, Email, Password).";
      return;
    }

    if (!this.isPasswordValid) {
      this.errorMessage = "Password does not meet security requirements. Minimum 12 characters, 1 uppercase letter, 1 number, and 1 special symbol (!@#$).";
      return;
    }

    this.isSubmitting = true;

    try {
      // 1. Register Account in ASP.NET Core API (inserts TmsUser & Student/Instructor in DB)
      await this.auth.register({
        email: this.regEmail.trim(),
        password: this.regPassword,
        firstName: this.regFirstName.trim(),
        lastName: this.regLastName.trim(),
        role: this.regRole,
      });

      const registeredRole = this.regRole as "Student" | "Instructor";
      const registeredEmail = this.regEmail.trim();
      const registeredPassword = this.regPassword;
      const firstName = this.regFirstName.trim();

      // 2. Pre-fill Sign In credentials & role tab
      this.loginEmail = registeredEmail;
      this.loginPassword = registeredPassword;
      this.selectedRole = registeredRole;

      // 3. Display explicit success banner
      this.successMessage = `Registration successful, ${firstName}! Your ${registeredRole} account has been inserted into the system. Click 'Sign In' below to access your portal.`;

      // 4. Switch to Sign In mode & clear registration form fields
      this.isLoginMode = true;

      this.regFirstName = "";
      this.regLastName = "";
      this.regEmail = "";
      this.regPassword = "";
    } catch (err: any) {
      const backendErrors = err?.error?.errors;
      let errorText = "";

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        errorText = backendErrors.join(" • ");
      } else {
        errorText = err?.error?.message || err?.error?.detail || "Registration failed. Please check your details and try again.";
      }

      if (errorText.toLowerCase().includes("already registered") || errorText.toLowerCase().includes("already exists")) {
        this.isAlreadyRegistered = true;
        const existingEmail = this.regEmail.trim();
        this.loginEmail = existingEmail;
        this.selectedRole = this.regRole;
        this.setMode(true, true);
        this.errorMessage = `An account with email '${existingEmail}' is already registered in the system. Please enter your password to sign in below.`;
      } else {
        this.errorMessage = errorText;
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  switchToLoginForEmail() {
    this.loginEmail = this.regEmail.trim();
    this.setMode(true);
  }
}
