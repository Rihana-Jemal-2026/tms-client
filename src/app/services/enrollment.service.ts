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
      studentId: 101,
      courseId: 302,
      studentName: "Dawit Abebe",
      courseName: "CS302 Web Architecture",
      status: "Pending",
      enrolledAt: "2026-08-18T10:00:00Z",
      submittedAt: "2026-08-18T10:00:00Z",
    },
    {
      id: "ENR-102",
      studentId: 102,
      courseId: 302,
      studentName: "Liya Tadesse",
      courseName: "CS302 Web Architecture",
      status: "Approved",
      enrolledAt: "2026-08-18T10:15:00Z",
      submittedAt: "2026-08-18T10:15:00Z",
    },
    {
      id: "ENR-103",
      studentId: 103,
      courseId: 401,
      studentName: "Abeba Kebede",
      courseName: "CS401 Database Internals",
      status: "Pending",
      enrolledAt: "2026-08-18T11:00:00Z",
      submittedAt: "2026-08-18T11:00:00Z",
    },
    {
      id: "ENR-104",
      studentId: 104,
      courseId: 101,
      studentName: "Taye Bikila",
      courseName: "CS101 Modern Web Development",
      status: "Approved",
      enrolledAt: "2026-08-18T11:30:00Z",
      submittedAt: "2026-08-18T11:30:00Z",
    },
  ];

  getAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.base).pipe(
      catchError(() => of(this.fallbackEnrollments)),
    );
  }

  approve(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/approve`, {}).pipe(
      catchError(() => of(undefined)),
    );
  }
}
