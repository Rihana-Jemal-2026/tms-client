import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { EnrollmentStore } from "../../store/enrollment.store";

interface CourseSegment {
  code: string;
  name: string;
  instructor: string;
  tier: string;
  seatsText: string;
  isUrgent?: boolean;
  isWaitlist?: boolean;
}

@Component({
  selector: "app-enrollment-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./enrollment-form.component.html",
  styleUrl: "./enrollment-form.component.scss",
})
export class EnrollmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private enrollmentStore = inject(EnrollmentStore);

  currentStep = signal<number>(1);
  submitted = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  availableCourses: CourseSegment[] = [
    {
      code: "CS-501",
      name: "Distributed Systems Architecture",
      instructor: "Prof. Alan Turing",
      tier: "Advanced Tier",
      seatsText: "2 Seats Left",
      isUrgent: true,
    },
    {
      code: "SEC-404",
      name: "Zero Trust Networks",
      instructor: "Dr. Grace Hopper",
      tier: "Intermediate Tier",
      seatsText: "12 Available",
    },
    {
      code: "ML-600",
      name: "Neural Network Dynamics",
      instructor: "Dr. Yann LeCun",
      tier: "Advanced Tier",
      seatsText: "Waitlist Only",
      isWaitlist: true,
    },
  ];

  filteredCourses = signal<CourseSegment[]>(this.availableCourses);
  searchQuery = signal<string>("");

  form = this.fb.nonNullable.group({
    courseCode: ["CS-501", Validators.required],
    courseName: ["Distributed Systems Architecture", Validators.required],
    studentId: [
      "STU-1001",
      [Validators.required, Validators.pattern("^STU-[0-9]{4}$")],
    ],
    legalName: ["Abebe Alemu", Validators.required],
    division: ["Core Systems Engineering", Validators.required],
    prereqsVerified: [true],
    justification: ["Required for upcoming software architecture and enterprise deployment project."],
    termsAccepted: [false, Validators.requiredTrue],
    term: ["Fall 2026", Validators.required],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      let regNo = "STU-1001";
      if (user.email.includes("alemu")) regNo = "STU-1002";
      else if (user.email.includes("rihana")) regNo = "STU-1003";

      this.form.patchValue({
        legalName: user.displayName,
        studentId: regNo,
      });
    }
  }

  filterCourses(query: string): void {
    this.searchQuery.set(query);
    if (!query.trim()) {
      this.filteredCourses.set(this.availableCourses);
      return;
    }
    const q = query.toLowerCase();
    this.filteredCourses.set(
      this.availableCourses.filter(
        (c) =>
          c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      )
    );
  }

  selectCourse(course: CourseSegment): void {
    this.form.patchValue({
      courseCode: course.code,
      courseName: course.name,
    });
    this.searchQuery.set(`${course.code}: ${course.name}`);
    setTimeout(() => this.nextStep(), 300);
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (!this.form.controls.courseCode.value) {
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
      courseCode: "CS-501",
      courseName: "Distributed Systems Architecture",
      studentId: user?.email.includes("alemu") ? "STU-1002" : (user?.email.includes("rihana") ? "STU-1003" : "STU-1001"),
      legalName: user?.displayName || "Abebe Alemu",
      division: "Core Systems Engineering",
      prereqsVerified: true,
      justification: "",
      termsAccepted: false,
      term: "Fall 2026",
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      const payload = this.form.getRawValue();

      const numId = parseInt(payload.studentId.replace(/\D/g, ""), 10) || 1001;
      const newEnrollment = {
        id: `ENR-${Date.now()}`,
        studentId: numId,
        courseId: 501,
        studentName: payload.legalName,
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

