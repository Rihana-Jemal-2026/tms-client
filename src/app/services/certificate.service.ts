import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Certificate, CertificateVerification } from "../models/certificate.model";

@Injectable({
  providedIn: "root",
})
export class CertificateService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/certificates`;

  private fallbackCertificates: Certificate[] = [
    {
      id: "CERT-2026-001",
      certificateNumber: "TMS-CS302-8921",
      studentId: 1001,
      studentName: "Abebe Alemu",
      courseId: 302,
      courseCode: "CS302",
      courseTitle: "Web Architecture & Cloud Services",
      issueDate: "2026-08-15T09:00:00Z",
      grade: "A+",
      gpa: 4.0,
      instructorName: "Dr. Marcus Vance",
      verificationCode: "VER-CS302-ABEBE-992",
      skillsAcquired: ["Angular 19", "ASP.NET Core 9", "Distributed Caching", "RESTful Architecture"]
    },
    {
      id: "CERT-2026-002",
      certificateNumber: "TMS-CS401-4410",
      studentId: 1002,
      studentName: "Alemu Tadesse",
      courseId: 401,
      courseCode: "CS401",
      courseTitle: "Database Internals & Distributed Storage",
      issueDate: "2026-07-20T14:30:00Z",
      grade: "A",
      gpa: 3.9,
      instructorName: "Prof. Elena Rostova",
      verificationCode: "VER-CS401-ALEMU-331",
      skillsAcquired: ["Query Optimization", "B-Trees & LSM", "Transactions", "PostgreSQL"]
    },
    {
      id: "CERT-2026-003",
      certificateNumber: "TMS-CS101-1029",
      studentId: 1003,
      studentName: "Rihana Mohammed",
      courseId: 101,
      courseCode: "CS101",
      courseTitle: "Introduction to Computer Science & Algorithms",
      issueDate: "2026-06-10T11:15:00Z",
      grade: "A+",
      gpa: 3.95,
      instructorName: "Dr. Marcus Vance",
      verificationCode: "VER-CS101-RIHANA-774",
      skillsAcquired: ["Algorithms", "Data Structures", "Big-O Notation", "Python"]
    }
  ];

  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(this.base).pipe(
      catchError(() => of(this.fallbackCertificates))
    );
  }

  getCertificateById(id: string): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.base}/${id}`).pipe(
      catchError(() => {
        const found = this.fallbackCertificates.find(c => c.id === id || c.certificateNumber === id);
        return of(found || this.fallbackCertificates[0]);
      })
    );
  }

  verifyCertificate(code: string): Observable<CertificateVerification> {
    return this.http.get<CertificateVerification>(`${this.base}/verify/${code}`).pipe(
      catchError(() => {
        const found = this.fallbackCertificates.find(
          c => c.verificationCode.toLowerCase() === code.toLowerCase()
        );
        if (found) {
          return of({ valid: true, verificationCode: code, certificate: found, verifiedAt: new Date().toISOString() });
        }
        return of({ valid: false, verificationCode: code, message: "Certificate code invalid or expired." });
      })
    );
  }
}
