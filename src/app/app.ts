import { Component, signal, inject, OnInit } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { EnrollmentStore } from "./store/enrollment.store";
import { ThemeService } from "./services/theme.service";
import { AuthService } from "./services/auth.service";
import { ThreeBackgroundComponent } from "./ui/three-background/three-background.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThreeBackgroundComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App implements OnInit {
  protected readonly title = signal("tms-client");
  private store = inject(EnrollmentStore);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  isAuthPage = signal(false);

  ngOnInit() {
    this.store.loadEnrollments();
    this.store.listenForLiveUpdates();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isAuthPage.set(event.urlAfterRedirects.includes("/login"));
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
