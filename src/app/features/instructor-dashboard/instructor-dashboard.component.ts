import { Component, inject, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { EnrollmentStore } from "../../store/enrollment.store";
import { AnalyticsChartComponent } from "../../ui/analytics-chart/analytics-chart";
import { EnrollmentListComponent } from "../enrollment-list/enrollment-list.component";

@Component({
  selector: "app-instructor-dashboard",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, AnalyticsChartComponent, EnrollmentListComponent],
  templateUrl: "./instructor-dashboard.component.html",
  styleUrl: "./instructor-dashboard.component.scss",
})
export class InstructorDashboardComponent implements OnInit {
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  approve(id: string | number): void {
    this.store.approveEnrollment(String(id));
  }

  reject(id: string | number): void {
    this.store.rejectEnrollment(String(id));
  }
}
