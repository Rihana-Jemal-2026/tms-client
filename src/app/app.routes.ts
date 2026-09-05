import { Routes } from "@angular/router";
import { roleGuard } from "./guards/role.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./features/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import(
        "./features/student-dashboard/student-dashboard.component"
      ).then((m) => m.StudentDashboardComponent),
  },
  {
    path: "student",
    loadComponent: () =>
      import(
        "./features/student-dashboard/student-dashboard.component"
      ).then((m) => m.StudentDashboardComponent),
  },
  {
    path: "command-center",
    canActivate: [roleGuard("Instructor")],
    loadComponent: () =>
      import(
        "./features/instructor-dashboard/instructor-dashboard.component"
      ).then((m) => m.InstructorDashboardComponent),
  },
  {
    path: "instructor",
    canActivate: [roleGuard("Instructor")],
    loadComponent: () =>
      import(
        "./features/instructor-dashboard/instructor-dashboard.component"
      ).then((m) => m.InstructorDashboardComponent),
  },
  {
    path: "courses/:id",
    loadComponent: () =>
      import("./features/course-detail/course-detail").then(
        (m) => m.CourseDetailComponent,
      ),
  },
  {
    path: "enroll",
    loadComponent: () =>
      import("./features/enrollment-form/enrollment-form.component").then(
        (m) => m.EnrollmentFormComponent,
      ),
  },
  {
    path: "enrollments",
    canActivate: [roleGuard("Admin")],
    loadComponent: () =>
      import("./features/enrollment-list/enrollment-list.component").then(
        (m) => m.EnrollmentListComponent,
      ),
  },
  {
    path: "grade-submission",
    canActivate: [roleGuard("Instructor")],
    loadComponent: () =>
      import(
        "./features/grade-submission/grade-submission.component"
      ).then((m) => m.GradeSubmissionComponent),
  },
  {
    path: "certificates",
    loadComponent: () =>
      import("./features/certificates/certificates.component").then(
        (m) => m.CertificatesComponent
      ),
  },
  {
    path: "reports",
    canActivate: [roleGuard("Admin")],
    loadComponent: () =>
      import("./features/reports/reports.component").then(
        (m) => m.ReportsComponent
      ),
  },
  {
    path: "unauthorized",
    loadComponent: () =>
      import("./features/unauthorized/unauthorized.component").then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
];