import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportService, CourseEnrollmentReport, AverageGpaReport } from "../../services/report.service";

export interface StudentChip {
  name: string;
  avatar: string;
  statusText: string;
}

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  activeHonorsCount = signal<number>(18);
  coursesByEnrollment = signal<CourseEnrollmentReport[]>([
    { title: "CS-501: Advanced Algorithms", enrollmentCount: 38 },
    { title: "CS-302: Data Structures", enrollmentCount: 35 },
    { title: "SEC-205: Cyber Defense", enrollmentCount: 32 },
    { title: "DS-401: Machine Learning", enrollmentCount: 28 },
  ]);

  averageGpaPerCourse = signal<AverageGpaReport[]>([
    { course: "CS-501", averageGPA: 3.85 },
    { course: "CS-302", averageGPA: 3.68 },
    { course: "DS-401", averageGPA: 3.45 },
    { course: "SEC-205", averageGPA: 3.20 },
  ]);

  unenrolledStudentChips = signal<StudentChip[]>([
    {
      name: "Abebe Alemu",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdEf1Kf8oCZ5FvCvJCH3vqDYcxjITdA0Ce50QRv6Ral-07KSl4IqMIHK3ut7YhACG-TQUOByz1nPy8wDfinMb_uwJLdlhWKwGdyOCO_V5R5DbOV2lomRUDIQ27DLkumloeT9qFNMXCrr-RVeB2iMkDu-wNyye4Z_GsCeXtRdm7psqHbJl28q_yREOrlIGqP4kf5LgIEUnhFpM7Dbuzi4djn_5h7ez70V-aOqayN0TBo_HKF1UliBTBuw",
      statusText: "Account Active",
    },
    {
      name: "Alemu Tadesse",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMozR09GwrXUNv8cpm5U9O8nZvT_CUNMLtIYCIRHWMk1WM-fhBdO6Xnqu48nGk1R6x-7aECVpTlHbcBbcGwF74SMk9uXyizGO_2YQUvPUIfiP8LcToSIOu5HBsco1Wuw4Z5CvLd_zU03KfQgjbHBpEyl6MCBzV6yiw_3sJSxgx_6aQ1Dfbrkz-RscELwmAxHeYzzji1ouMsazyFhfs1uTsIHlRkaztn_JK7fCULus2FWQUSvECMG5WtA",
      statusText: "Registration Verified",
    },
    {
      name: "Rihana Mohammed",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEEyf2un2__DBpS_Fmlc2sgQTpzgvLepFFXAb-OJi_E7rdPGgvGUtuTyf60m5nWIG_-YbHJTugu-dblRcBAH8GByThnsMOFU9U6yx8hlZSNoIDjsfwoh-7n4dnX2FtEbRtHOkU4UuAmflQt9GNh8U93BflLs0GY6A25pFYLHxRwLbGUxoq3Z6Kx-4mbm3hgYiXAP8M1uGSq9DnmPiPaF-Bh6gGkACPwFXRZ3znj6rsb7mSfQf47HysNw",
      statusText: "Honors Candidate",
    },
  ]);

  remindStatus = signal<string>("");

  ngOnInit(): void {
    this.reportService.getActiveHonorsCount().subscribe((count) => {
      if (count > 0) this.activeHonorsCount.set(count);
    });
    this.reportService.getCoursesByEnrollment().subscribe((list) => {
      if (list && list.length > 0) this.coursesByEnrollment.set(list);
    });
    this.reportService.getAverageGpaPerCourse().subscribe((list) => {
      if (list && list.length > 0) this.averageGpaPerCourse.set(list);
    });
  }

  remindStudent(studentName: string): void {
    this.remindStatus.set(`Reminder notification transmitted to ${studentName}`);
    setTimeout(() => this.remindStatus.set(""), 3000);
  }

  remindAll(): void {
    this.remindStatus.set("Batch reminder transmitted to all unenrolled students.");
    setTimeout(() => this.remindStatus.set(""), 3500);
  }

  exportEnrollmentReportCsv(): void {
    const headers = ["Course Title", "Total Enrolled Students"];
    const rows = this.coursesByEnrollment().map((c) => [`"${c.title}"`, c.enrollmentCount]);
    this.downloadCsv("TMS_Course_Enrollment_Report.csv", [headers, ...rows]);
  }

  exportGpaReportCsv(): void {
    const headers = ["Course Title", "Average GPA"];
    const rows = this.averageGpaPerCourse().map((c) => [`"${c.course}"`, c.averageGPA.toFixed(2)]);
    this.downloadCsv("TMS_Course_Average_GPA_Report.csv", [headers, ...rows]);
  }

  private downloadCsv(filename: string, data: (string | number)[][]): void {
    const csvContent = "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
