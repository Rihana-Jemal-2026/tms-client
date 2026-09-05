import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TmsUser {
  email: string;
  displayName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private accessToken = signal<string | null>(null);
  currentUser = signal<TmsUser | null>(null);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role || user?.role === 'Admin';
  }

  async login(credentials: LoginRequest): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
    );
    this.accessToken.set(res.accessToken);

    // Decode user payload from JWT
    const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
    
    const email =
      payload.email ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      payload.sub ||
      '';

    const firstName = payload.FirstName || payload.given_name || '';
    const lastName = payload.LastName || payload.family_name || '';
    const fullName =
      firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : payload.name ||
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
          (email ? email.split('@')[0] : 'User');

    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload.role ||
      'Student';

    this.currentUser.set({
      email,
      displayName: fullName,
      role,
    });
  }

  async register(request: RegisterRequest): Promise<void> {
    await firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/auth/register`, request)
    );
  }

  logout(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
  }
}
