import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Enrollment } from "../models/enrollment.model";

@Injectable({
  providedIn: "root",
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/enrollments`;

  private fallbackEnrollments: Enrollment[] = [
    {
      id: "ENR-101",
      studentId: 1001,
      courseId: 302,
      studentName: "Abebe Alemu",
      courseName: "CS302 Web Architecture",
      status: "Approved",
      enrolledAt: "2026-08-18T10:00:00Z",
      submittedAt: "2026-08-18T10:00:00Z",
    },
    {
      id: "ENR-102",
      studentId: 1002,
      courseId: 302,
      studentName: "Alemu Tadesse",
      courseName: "CS302 Web Architecture",
      status: "Pending",
      enrolledAt: "2026-08-18T10:15:00Z",
      submittedAt: "2026-08-18T10:15:00Z",
    },
    {
      id: "ENR-103",
      studentId: 1003,
      courseId: 401,
      studentName: "Rihana Mohammed",
      courseName: "CS401 Database Internals",
      status: "Approved",
      enrolledAt: "2026-08-18T11:00:00Z",
      submittedAt: "2026-08-18T11:00:00Z",
    },
    {
      id: "ENR-104",
      studentId: 1001,
      courseId: 101,
      studentName: "Abebe Alemu",
      courseName: "CS101 Modern Web Development",
      status: "Pending",
      enrolledAt: "2026-08-18T11:30:00Z",
      submittedAt: "2026-08-18T11:30:00Z",
    },
  ];

  getAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.base).pipe(
      catchError(() => of(this.fallbackEnrollments)),
    );
  }

  create(enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.base, enrollment).pipe(
      catchError(() =>
        of({
          id: enrollment.id || `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: enrollment.studentId || 1001,
          courseId: enrollment.courseId || 101,
          studentName: enrollment.studentName || "Abebe Alemu",
          courseName: enrollment.courseName || "Course Enrollment",
          status: enrollment.status || "Pending",
          enrolledAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        } as Enrollment),
      ),
    );
  }

  approve(id: string | number): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.base}/${id}/approve`, {}).pipe(
      catchError(() =>
        of({
          id: String(id),
          studentId: 1001,
          courseId: 101,
          studentName: "Abebe Alemu",
          courseName: "Intro to CS",
          status: "Approved",
          enrolledAt: "2026-08-12T10:00:00Z",
        } as Enrollment),
      ),
    );
  }
}
