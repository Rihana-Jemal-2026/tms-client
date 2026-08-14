import { Component, inject, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { EnrollmentStore } from "../../store/enrollment.store";
import { AnalyticsChartComponent } from "../../ui/analytics-chart/analytics-chart";
import { EnrollmentListComponent } from "../enrollment-list/enrollment-list.component";

@Component({
  selector: "app-instructor-dashboard",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnalyticsChartComponent, EnrollmentListComponent],
  templateUrl: "./instructor-dashboard.component.html",
  styleUrl: "./instructor-dashboard.component.scss",
})
export class InstructorDashboardComponent implements OnInit {
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }
}
