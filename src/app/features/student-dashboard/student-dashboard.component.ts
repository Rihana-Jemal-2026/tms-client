import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { rxResource } from "@angular/core/rxjs-interop";
import { RouterLink, Router } from "@angular/router";
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
  private router = inject(Router);
  enrollmentStore = inject(EnrollmentStore);

  studentName = computed(() => this.auth.currentUser()?.displayName ?? "Student");
  userEmail = computed(() => this.auth.currentUser()?.email ?? "");

  bonusCredits = signal(0);
  searchQuery = signal("");
  selectedCategories = signal<string[]>([]);
  selectedDifficulty = signal<string | null>(null);
  maxDuration = signal<number>(40);

  currentPage = signal<number>(1);
  pageSize = signal<number>(6);

  selectedCourse = signal<Course | null>(null);
  enrollmentMessage = signal<string>("");

  ngOnInit() {
    this.enrollmentStore.loadEnrollments();
  }

  // Filter enrollments specifically belonging to this logged-in student
  userEnrollments = computed(() => {
    const all = this.enrollmentStore.entities();
    const currentUser = this.auth.currentUser();
    const name = (currentUser?.displayName || "").toLowerCase().trim();
    const email = (currentUser?.email || "").toLowerCase().trim();
    const sId = (currentUser?.studentId || "").toLowerCase().trim();

    return all.filter((e) => {
      const eName = (e.studentName || "").toLowerCase().trim();
      const eIdStr = String(e.studentId || "").toLowerCase().trim();

      if (!currentUser) return true; // Show demo items if not logged in

      return (
        (name && (eName.includes(name) || name.includes(eName))) ||
        (email && (eName.includes(email) || eIdStr.includes(email))) ||
        (sId && (eIdStr.includes(sId) || sId.includes(eIdStr)))
      );
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

  isMaxCreditsReached = computed(() => {
    return (this.activeCoursesCount() + this.pendingCount()) * 3 >= 18;
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

  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  // Helper method to derive category from course code / title
  getCourseCategory(c: Course): string {
    const text = `${c.code} ${c.title}`.toLowerCase();
    if (text.includes("data") || text.includes("db") || text.includes("sql") || text.includes("storage")) return "Data Engineering";
    if (text.includes("cloud") || text.includes("azure") || text.includes("aws") || text.includes("arch")) return "Cloud Architecture";
    if (text.includes("sec") || text.includes("cyber") || text.includes("defen") || text.includes("auth")) return "Cybersecurity";
    if (text.includes("ai") || text.includes("machine") || text.includes("learn") || text.includes("model")) return "Machine Learning";
    if (text.includes("web") || text.includes("react") || text.includes("angular") || text.includes("dev")) return "Software Engineering";
    return "Computer Science";
  }

  // Helper method to derive estimated duration from course ID
  getCourseDuration(c: Course): number {
    return ((c.id * 7) % 36) + 4; // Returns 4h to 40h
  }

  // Helper method to derive difficulty level from course ID
  getCourseDifficulty(c: Course): "Beginner" | "Intermediate" | "Advanced" {
    const mod = c.id % 3;
    if (mod === 0) return "Beginner";
    if (mod === 1) return "Intermediate";
    return "Advanced";
  }

  filteredCourses = computed(() => {
    const list = this.coursesResource.value() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    const cats = this.selectedCategories();
    const diff = this.selectedDifficulty();
    const maxDur = this.maxDuration();

    return list.filter((c: Course) => {
      // 1. Search Query Filter
      if (query && !c.title.toLowerCase().includes(query) && !c.code.toLowerCase().includes(query)) {
        return false;
      }
      // 2. Category Filter
      if (cats.length > 0) {
        const cCat = this.getCourseCategory(c);
        if (!cats.includes(cCat)) return false;
      }
      // 3. Difficulty Filter
      if (diff) {
        const cDiff = this.getCourseDifficulty(c);
        if (cDiff !== diff) return false;
      }
      // 4. Duration Filter
      if (maxDur < 40) {
        const cDur = this.getCourseDuration(c);
        if (cDur > maxDur) return false;
      }
      return true;
    });
  });

  totalPages = computed(() => {
    const total = this.filteredCourses().length;
    return Math.ceil(total / this.pageSize()) || 1;
  });

  paginatedCourses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredCourses().slice(start, start + this.pageSize());
  });

  pageNumbers = computed(() => {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleCategory(category: string) {
    const current = this.selectedCategories();
    if (current.includes(category)) {
      this.selectedCategories.set(current.filter((c) => c !== category));
    } else {
      this.selectedCategories.set([...current, category]);
    }
    this.currentPage.set(1);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  selectDifficulty(diff: string) {
    if (this.selectedDifficulty() === diff) {
      this.selectedDifficulty.set(null);
    } else {
      this.selectedDifficulty.set(diff);
    }
    this.currentPage.set(1);
  }

  updateMaxDuration(val: number) {
    this.maxDuration.set(val);
    this.currentPage.set(1);
  }

  resetFilters() {
    this.searchQuery.set("");
    this.selectedCategories.set([]);
    this.selectedDifficulty.set(null);
    this.maxDuration.set(40);
    this.currentPage.set(1);
  }

  registerForClass() {
    this.bonusCredits.update((c) => c + 3);
  }

  isEnrolledInCourse(course: Course): boolean {
    return this.userEnrollments().some(
      (e) => e.courseId === course.id || (e.courseName && e.courseName.toLowerCase().includes(course.code.toLowerCase()))
    );
  }

  handleEnroll(course: Course) {
    this.router.navigate(["/enroll"], {
      queryParams: {
        courseId: course.id,
        code: course.code,
        title: course.title,
      },
    });
  }
}