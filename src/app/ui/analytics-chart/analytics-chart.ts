import { Component, input } from "@angular/core";
import { Enrollment } from "../../models/enrollment.model";

@Component({
  selector: "tms-analytics-chart",
  standalone: true,
  templateUrl: "./analytics-chart.html",
  styleUrl: "./analytics-chart.scss",
})
export class AnalyticsChartComponent {
  data = input<Enrollment[]>([]);
}
