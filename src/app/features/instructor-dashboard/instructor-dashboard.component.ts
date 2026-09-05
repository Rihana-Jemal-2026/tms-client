import { Component, inject, computed, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { EnrollmentStore } from "../../store/enrollment.store";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-instructor-dashboard",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: "./instructor-dashboard.component.html",
  styleUrl: "./instructor-dashboard.component.scss",
})
export class InstructorDashboardComponent implements OnInit {
  store = inject(EnrollmentStore);
  auth = inject(AuthService);

  isAdmin = computed(() => this.auth.currentUser()?.role === "Admin");
  isTeacher = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === "Instructor" || role === "Teacher" || !role;
  });

  instructorName = computed(() => this.auth.currentUser()?.displayName ?? "Instructor");

  // Instructors ONLY see students who are APPROVED.
  // Pending students are NOT visible to instructors until approved.
  assignedStudents = computed(() => {
    const all = this.store.entities();
    if (this.isAdmin()) return all;
    return all.filter((e) => e.status === "Approved");
  });

  approvedStudents = computed(() => this.assignedStudents().filter((e) => e.status === "Approved"));
  pendingStudents = computed(() => this.assignedStudents().filter((e) => e.status === "Pending"));

  coursesTaughtCount = computed(() => (this.isAdmin() ? 4 : 2));
  totalStudentsTaughtCount = computed(() => this.assignedStudents().length);
  activeStudentsCount = computed(() => this.approvedStudents().length);
  studentsAwaitingGradesCount = computed(() => this.approvedStudents().length);

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
