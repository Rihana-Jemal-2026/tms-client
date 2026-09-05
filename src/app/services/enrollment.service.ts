import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
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

  private localEnrollments: Enrollment[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("tms_local_enrollments");
      if (stored) {
        this.localEnrollments = JSON.parse(stored);
      }
    } catch {
      this.localEnrollments = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("tms_local_enrollments", JSON.stringify(this.localEnrollments));
    } catch {
      // Ignore storage error
    }
  }

  getAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.base).pipe(
      map((serverEnrollments) => {
        const itemMap = new Map<string, Enrollment>();
        // Add server enrollments first
        for (const item of serverEnrollments) {
          itemMap.set(String(item.id), item);
        }
        // Override or append locally submitted enrollments
        for (const item of this.localEnrollments) {
          itemMap.set(String(item.id), item);
        }
        return Array.from(itemMap.values());
      }),
      catchError(() => of(this.getCombinedLocalAndFallback())),
    );
  }

  private getCombinedLocalAndFallback(): Enrollment[] {
    const itemMap = new Map<string, Enrollment>();
    for (const item of this.fallbackEnrollments) {
      itemMap.set(String(item.id), item);
    }
    for (const item of this.localEnrollments) {
      itemMap.set(String(item.id), item);
    }
    return Array.from(itemMap.values());
  }

  create(enrollment: Partial<Enrollment>): Observable<Enrollment> {
    const created: Enrollment = {
      id: enrollment.id || `ENR-${Date.now()}`,
      studentId: enrollment.studentId || 1001,
      courseId: enrollment.courseId || 101,
      studentName: enrollment.studentName || "Student",
      courseName: enrollment.courseName || "Course Enrollment",
      status: enrollment.status || "Pending",
      enrolledAt: enrollment.enrolledAt || new Date().toISOString(),
      submittedAt: enrollment.submittedAt || new Date().toISOString(),
    };

    // Store in local list & localStorage
    const existsIndex = this.localEnrollments.findIndex((e) => e.id === created.id);
    if (existsIndex >= 0) {
      this.localEnrollments[existsIndex] = created;
    } else {
      this.localEnrollments.unshift(created);
    }
    this.saveToStorage();

    return this.http.post<Enrollment>(this.base, enrollment).pipe(
      catchError(() => of(created)),
    );
  }

  approve(id: string | number): Observable<Enrollment> {
    const targetId = String(id);
    // Also update in local storage if present
    const foundLocal = this.localEnrollments.find((e) => String(e.id) === targetId);
    if (foundLocal) {
      foundLocal.status = "Approved";
      this.saveToStorage();
    }

    return this.http.put<Enrollment>(`${this.base}/${id}/approve`, {}).pipe(
      catchError(() =>
        of({
          id: targetId,
          studentId: 1001,
          courseId: 101,
          studentName: "Student",
          courseName: "Course",
          status: "Approved",
          enrolledAt: new Date().toISOString(),
        } as Enrollment),
      ),
    );
  }
}
