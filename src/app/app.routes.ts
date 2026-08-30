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
    path: "command-center",
    loadComponent: () =>
      import(
        "./features/instructor-dashboard/instructor-dashboard.component"
      ).then((m) => m.InstructorDashboardComponent),
  },
  {
    path: "dashboard",
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
    loadComponent: () =>
      import("./features/enrollment-list/enrollment-list.component").then(
        (m) => m.EnrollmentListComponent,
      ),
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
    path: "grade-submission",
    canActivate: [roleGuard("Instructor")],
    loadComponent: () =>
      import(
        "./features/grade-submission/grade-submission.component"
      ).then((m) => m.GradeSubmissionComponent),
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
];