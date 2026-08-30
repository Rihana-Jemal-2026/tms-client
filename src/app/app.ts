import { Component, signal, inject, OnInit } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from "@angular/router";
import { EnrollmentStore } from "./store/enrollment.store";
import { ThemeService } from "./services/theme.service";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App implements OnInit {
  protected readonly title = signal("tms-client");
  private store = inject(EnrollmentStore);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.store.loadEnrollments();
    this.store.listenForLiveUpdates();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
