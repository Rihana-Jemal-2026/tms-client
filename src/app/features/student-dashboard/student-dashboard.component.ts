import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { rxResource } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { CourseCardComponent } from "../../ui/course-card/course-card";
import { Course } from "../../models/course.model";
import { CourseService } from "../../services/course.service";
import { EnrollmentStore } from "../../store/enrollment.store";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent implements OnInit {
  private api = inject(CourseService);
  private auth = inject(AuthService);
  enrollmentStore = inject(EnrollmentStore);

  studentName = computed(() => this.auth.currentUser()?.displayName ?? "Student");
  userEmail = computed(() => this.auth.currentUser()?.email ?? "");

  bonusCredits = signal(0);
  searchQuery = signal("");
  selectedCategory = signal<string | null>(null);

  ngOnInit() {
    this.enrollmentStore.loadEnrollments();
  }

  // Filter enrollments specifically belonging to this logged-in student
  userEnrollments = computed(() => {
    const all = this.enrollmentStore.entities();
    const name = this.studentName().toLowerCase();
    const email = this.userEmail().toLowerCase();

    return all.filter((e) => {
      const eName = (e.studentName || "").toLowerCase();
      const eIdStr = String(e.studentId || "").toLowerCase();
      return eName.includes(name) || (email && (eName.includes(email) || eIdStr.includes(email)));
    });
  });

  activeCoursesCount = computed(() => {
    return this.userEnrollments().filter((e) => e.status === "Approved").length;
  });

  pendingCount = computed(() => {
    return this.userEnrollments().filter((e) => e.status === "Pending").length;
  });

  earnedCredits = computed(() => {
    return this.activeCoursesCount() * 3 + this.bonusCredits();
  });

  hoursLearned = computed(() => {
    return this.activeCoursesCount() * 12;
  });

  overallGpa = computed(() => {
    return this.activeCoursesCount() > 0 ? "3.85 / 4.0" : "0.0 / 4.0";
  });

  trackProgressPercent = computed(() => {
    if (this.activeCoursesCount() === 0) return 0;
    return Math.min(100, Math.round((this.activeCoursesCount() / 4) * 100));
  });

  modulesPassed = computed(() => {
    return this.activeCoursesCount() * 5;
  });

  loggedHours = computed(() => {
    return this.activeCoursesCount() * 14;
  });

  graduationStatus = computed(() => {
    if (this.earnedCredits() >= 120) return "Eligible for Graduation";
    if (this.activeCoursesCount() > 0) return "In Progress";
    return "Not Started";
  });

  selectedCourse = signal<Course | null>(null);
  enrollmentMessage = signal<string>("");

  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  filteredCourses = computed(() => {
    const list = this.coursesResource.value() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  });

  registerForClass() {
    this.bonusCredits.update((c) => c + 3);
  }

  isEnrolledInCourse(course: Course): boolean {
    return this.userEnrollments().some(
      (e) => e.courseId === course.id || (e.courseName && e.courseName.toLowerCase().includes(course.code.toLowerCase()))
    );
  }

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    const student = this.auth.currentUser();
    const studentName = student?.displayName || "Abebe Alemu";
    const studentEmail = student?.email || "abebe@tms.com";

    // Determine student ID
    let studentId = 1001;
    if (studentEmail.includes("alemu")) studentId = 1002;
    else if (studentEmail.includes("rihana")) studentId = 1003;

    if (this.isEnrolledInCourse(course)) {
      this.enrollmentMessage.set(`You are already enrolled in ${course.title}.`);
      setTimeout(() => this.enrollmentMessage.set(""), 3500);
      return;
    }

    const newEnrollment = {
      id: `ENR-${Date.now()}`,
      studentId: studentId,
      courseId: course.id,
      studentName: studentName,
      courseName: `${course.code} ${course.title}`,
      status: "Approved" as const,
      enrolledAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    this.enrollmentStore.addEnrollment(newEnrollment);
    this.enrollmentMessage.set(`Successfully enrolled in ${course.title}. Your seat is confirmed.`);
    setTimeout(() => this.enrollmentMessage.set(""), 4500);
  }

  resetFilters() {
    this.searchQuery.set("");
    this.selectedCategory.set(null);
  }
}