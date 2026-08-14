import { Component, signal, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { EnrollmentStore } from "./store/enrollment.store";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App implements OnInit {
  protected readonly title = signal("tms-client");
  private store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
    this.store.listenForLiveUpdates();
  }
}
