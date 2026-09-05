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
    }
  ];

  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(this.base).pipe(
      catchError(() => of([]))
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
