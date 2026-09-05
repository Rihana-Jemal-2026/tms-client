export interface Certificate {
  id: string;
  certificateNumber: string;
  studentId: number;
  studentName: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  issueDate: string;
  grade: string;
  gpa: number;
  instructorName: string;
  verificationCode: string;
  skillsAcquired: string[];
}

export interface CertificateVerification {
  valid: boolean;
  verificationCode: string;
  certificate?: Certificate;
  verifiedAt?: string;
  message?: string;
}
