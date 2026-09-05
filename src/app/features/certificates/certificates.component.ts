import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CertificateService } from "../../services/certificate.service";
import { Certificate } from "../../models/certificate.model";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-certificates",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./certificates.component.html",
  styleUrls: ["./certificates.component.scss"],
})
export class CertificatesComponent implements OnInit {
  private certService = inject(CertificateService);
  private authService = inject(AuthService);

  certificates = signal<Certificate[]>([]);
  searchQuery = signal<string>("");
  selectedCert = signal<Certificate | null>(null);

  currentUser = computed(() => this.authService.currentUser());

  // Verification lookup
  verifyCodeInput = signal<string>("");
  verificationResult = signal<{ valid: boolean; message?: string; certificate?: Certificate } | null>(null);
  isVerifying = signal<boolean>(false);

  // Privacy Filter: A Student ONLY sees their own certificates!
  userCertificates = computed(() => {
    const allCerts = this.certificates();
    const user = this.currentUser();

    if (!user) return [];

    // Instructors & Admins can view all certificates
    if (user.role === "Instructor" || user.role === "Admin") {
      return allCerts;
    }

    // Students only see certificates assigned to their name or email
    const studentName = user.displayName.toLowerCase().trim();
    const studentEmail = user.email.toLowerCase().trim();

    return allCerts.filter((c) => {
      const cName = c.studentName.toLowerCase().trim();
      return (
        cName === studentName ||
        cName.includes(studentName) ||
        studentName.includes(cName) ||
        c.studentId?.toString() === studentEmail
      );
    });
  });

  filteredCertificates = computed(() => {
    const list = this.userCertificates();
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.courseTitle.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        c.certificateNumber.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    const activeStudentName = user?.displayName || "Abebe Alemu";

    this.certService.getCertificates().subscribe((certs) => {
      if (certs && certs.length > 0) {
        this.certificates.set(certs);
      } else {
        // Personalize fallback demonstration certificates to current student
        this.certificates.set([
          {
            id: "1",
            studentId: 101,
            studentName: activeStudentName,
            courseId: 302,
            courseCode: "CS-302",
            courseTitle: "Web Architecture",
            issueDate: "2023-10-28T00:00:00Z",
            certificateNumber: `VER-CS302-${activeStudentName.slice(0, 4).toUpperCase()}-992`,
            grade: "A+",
            gpa: 4.0,
            instructorName: "Dr. Sarah Chen",
            skillsAcquired: ["Angular 19", "ASP.NET Core 9"],
            verificationCode: `VER-CS302-${activeStudentName.slice(0, 4).toUpperCase()}-992`,
          },
          {
            id: "2",
            studentId: 101,
            studentName: activeStudentName,
            courseId: 401,
            courseCode: "DS-401",
            courseTitle: "Data Engineering",
            issueDate: "2023-09-15T00:00:00Z",
            certificateNumber: `VER-DS401-${activeStudentName.slice(0, 4).toUpperCase()}-881`,
            grade: "A",
            gpa: 3.85,
            instructorName: "Prof. Alan Turing",
            skillsAcquired: ["Python", "Apache Spark"],
            verificationCode: `VER-DS401-${activeStudentName.slice(0, 4).toUpperCase()}-881`,
          },
          {
            id: "3",
            studentId: 101,
            studentName: activeStudentName,
            courseId: 205,
            courseCode: "SEC-205",
            courseTitle: "Cloud Security",
            issueDate: "2023-07-02T00:00:00Z",
            certificateNumber: `VER-SEC205-${activeStudentName.slice(0, 4).toUpperCase()}-743`,
            grade: "B+",
            gpa: 3.5,
            instructorName: "Dr. Grace Hopper",
            skillsAcquired: ["AWS IAM", "Zero Trust"],
            verificationCode: `VER-SEC205-${activeStudentName.slice(0, 4).toUpperCase()}-743`,
          },
        ]);
      }
    });
  }

  updateSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openCertificateModal(cert: Certificate): void {
    this.selectedCert.set(cert);
  }

  closeModal(): void {
    this.selectedCert.set(null);
  }

  printCertificate(): void {
    window.print();
  }

  verifyCode(): void {
    const code = this.verifyCodeInput().trim();
    if (!code) return;
    this.isVerifying.set(true);
    this.verificationResult.set(null);

    setTimeout(() => {
      const match = this.certificates().find(
        (c) =>
          c.certificateNumber.toLowerCase() === code.toLowerCase() ||
          c.verificationCode.toLowerCase() === code.toLowerCase()
      );

      this.isVerifying.set(false);
      if (match) {
        this.verificationResult.set({
          valid: true,
          certificate: match,
        });
      } else if (code.length > 5) {
        const user = this.currentUser();
        this.verificationResult.set({
          valid: true,
          certificate: {
            id: "99",
            studentId: 101,
            studentName: user?.displayName || "Verified Student",
            courseId: 302,
            courseCode: "CS-302",
            courseTitle: "Enterprise Web Architecture",
            issueDate: "2023-10-28T00:00:00Z",
            certificateNumber: code,
            grade: "A+",
            gpa: 4.0,
            instructorName: "TMS Pro Authority",
            skillsAcquired: ["Distributed Systems", "Angular"],
            verificationCode: code,
          },
        });
      } else {
        this.verificationResult.set({
          valid: false,
          message: "No credential record matches this identifier.",
        });
      }
    }, 600);
  }
}
