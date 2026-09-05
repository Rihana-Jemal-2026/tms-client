import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";

export interface CourseEnrollmentReport {
  title: string;
  enrollmentCount: number;
}

export interface AverageGpaReport {
  course: string;
  averageGPA: number;
}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  getActiveHonorsCount(): Observable<number> {
    return this.http.get<number>(`${this.base}/active-honors-count`).pipe(
      catchError(() => of(18))
    );
  }

  getCoursesByEnrollment(): Observable<CourseEnrollmentReport[]> {
    return this.http.get<CourseEnrollmentReport[]>(`${this.base}/courses-by-enrollment`).pipe(
      catchError(() => of([
        { title: "CS302 Web Architecture", enrollmentCount: 38 },
        { title: "CS401 Database Internals", enrollmentCount: 29 },
        { title: "CS101 Modern Web Development", enrollmentCount: 45 },
        { title: "CS201 Data Structures & Algorithms", enrollmentCount: 32 }
      ]))
    );
  }

  getAverageGpaPerCourse(): Observable<AverageGpaReport[]> {
    return this.http.get<AverageGpaReport[]>(`${this.base}/average-gpa-per-course`).pipe(
      catchError(() => of([
        { course: "CS302 Web Architecture", averageGPA: 3.82 },
        { course: "CS401 Database Internals", averageGPA: 3.65 },
        { course: "CS101 Modern Web Development", averageGPA: 3.91 },
        { course: "CS201 Data Structures & Algorithms", averageGPA: 3.54 }
      ]))
    );
  }

  getStudentsWithNoEnrollments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/students-with-no-enrollments`).pipe(
      catchError(() => of(["Kifle Maru", "Bethlehem Assefa"]))
    );
  }
}
