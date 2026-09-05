import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportService, CourseEnrollmentReport, AverageGpaReport } from "../../services/report.service";

export interface StudentChip {
  name: string;
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

  getInitials(name: string): string {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

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
      statusText: "Account Active",
    },
    {
      name: "Alemu Tadesse",
      statusText: "Registration Verified",
    },
    {
      name: "Rihana Mohammed",
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
