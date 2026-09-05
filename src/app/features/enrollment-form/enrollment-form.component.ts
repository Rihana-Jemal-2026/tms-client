import { Component, inject, signal, computed, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CourseService } from "../../services/course.service";
import { EnrollmentStore } from "../../store/enrollment.store";
import { Course } from "../../models/course.model";

@Component({
  selector: "app-enrollment-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: "./enrollment-form.component.html",
  styleUrl: "./enrollment-form.component.scss",
})
export class EnrollmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private enrollmentStore = inject(EnrollmentStore);

  currentStep = signal<number>(1);
  submitted = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  catalogCourses = signal<Course[]>([]);
  selectedCourse = signal<Course | null>(null);
  searchQuery = signal<string>("");

  form = this.fb.nonNullable.group({
    courseCode: ["", Validators.required],
    courseName: ["", Validators.required],
    studentId: [
      "STU-1001",
      [Validators.required, Validators.pattern("^STU-[0-9]{4}$")],
    ],
    legalName: ["", Validators.required],
    division: ["Core Systems Engineering", Validators.required],
    prereqsVerified: [true],
    justification: ["Required for upcoming software architecture and enterprise deployment project."],
    termsAccepted: [false, Validators.requiredTrue],
    term: ["Fall 2026", Validators.required],
  });

  isCourseRegistered(courseCode: string): boolean {
    if (!courseCode) return false;
    const catalogItem = this.catalogCourses().find((c) => c.code.toLowerCase() === courseCode.toLowerCase());
    const targetCode = catalogItem ? catalogItem.code.toLowerCase() : courseCode.toLowerCase();
    const targetId = catalogItem ? catalogItem.id : null;

    const user = this.auth.currentUser();
    const studentName = (user?.displayName || "").toLowerCase().trim();
    const studentEmail = (user?.email || "").toLowerCase().trim();
    const studentId = (user?.studentId || "").toLowerCase().trim();

    return this.enrollmentStore.entities().some((e) => {
      const eName = (e.studentName || "").toLowerCase().trim();
      const eIdStr = String(e.studentId || "").toLowerCase().trim();
      const eCourseName = (e.courseName || "").toLowerCase().trim();

      const matchStudent =
        !user ||
        (studentName && (eName.includes(studentName) || studentName.includes(eName))) ||
        (studentEmail && (eName.includes(studentEmail) || eIdStr.includes(studentEmail))) ||
        (studentId && (eIdStr.includes(studentId) || studentId.includes(eIdStr)));

      const matchCourse =
        (targetId !== null && e.courseId === targetId) ||
        (targetCode && eCourseName.includes(targetCode));

      return matchStudent && matchCourse && (e.status === "Pending" || e.status === "Approved");
    });
  }

  isAlreadyEnrolled = computed(() => {
    const course = this.selectedCourse();
    return course ? this.isCourseRegistered(course.code) : false;
  });

  ngOnInit(): void {
    // 1. Set current user details
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        legalName: user.displayName,
        studentId: user.studentId || "STU-1001",
      });
    }

    // 2. Fetch catalog courses from API database
    this.courseService.getAll().subscribe((courses) => {
      this.catalogCourses.set(courses);

      // Check query params for pre-selected course
      const params = this.route.snapshot.queryParams;
      const qCode = params["code"];
      const qId = params["courseId"] ? Number(params["courseId"]) : null;

      let matched = courses.find(
        (c) => (qId && c.id === qId) || (qCode && c.code.toLowerCase() === qCode.toLowerCase())
      );

      // Only auto-select if matching course was specified in query params
      if (matched) {
        this.onCourseDropdownChange(matched.code);
      }
    });
  }

  onCourseDropdownChange(code: string): void {
    const found = this.catalogCourses().find((c) => c.code === code);
    if (found) {
      this.selectedCourse.set(found);
      this.form.patchValue({
        courseCode: found.code,
        courseName: found.title,
      });
    }
  }

  selectCourse(course: Course): void {
    this.selectedCourse.set(course);
    this.form.patchValue({
      courseCode: course.code,
      courseName: course.title,
    });
    setTimeout(() => this.nextStep(), 300);
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (!this.form.controls.courseCode.value || !this.selectedCourse() || this.isAlreadyEnrolled()) {
        return;
      }
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (
        this.form.controls.studentId.invalid ||
        this.form.controls.legalName.invalid
      ) {
        this.form.controls.studentId.markAsTouched();
        this.form.controls.legalName.markAsTouched();
        return;
      }
      this.currentStep.set(3);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  resetForm(): void {
    this.currentStep.set(1);
    this.submitted.set(false);
    const user = this.auth.currentUser();

    this.form.reset({
      courseCode: "",
      courseName: "",
      studentId: user?.email.includes("alemu") ? "STU-1002" : (user?.email.includes("rihana") ? "STU-1003" : "STU-1001"),
      legalName: user?.displayName || "Student",
      division: "Core Systems Engineering",
      prereqsVerified: true,
      justification: "",
      termsAccepted: false,
      term: "Fall 2026",
    });

    this.selectedCourse.set(null);
  }

  submit(): void {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      const payload = this.form.getRawValue();
      const course = this.selectedCourse();

      const user = this.auth.currentUser();
      const numId = parseInt(payload.studentId.replace(/\D/g, ""), 10) || 1001;
      const newEnrollment = {
        id: `ENR-${Date.now()}`,
        studentId: numId,
        courseId: course?.id || 101,
        studentName: user?.displayName || payload.legalName || "Student",
        courseName: `${payload.courseCode} ${payload.courseName}`,
        status: "Pending" as const,
        enrolledAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      this.enrollmentStore.addEnrollment(newEnrollment);

      setTimeout(() => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
      }, 700);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
