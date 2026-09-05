import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface GradePayload {
  studentId: number;
  courseId: number;
  score: number;
  letterGrade?: string;
  feedbackNote?: string;
}

export interface BatchGradeResponse {
  success: boolean;
  publishedCount: number;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class GradeService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl || ""}/api/grades`;

  postGrade(
    payload: GradePayload,
  ): Observable<{ id: string; success: boolean; letterGrade?: string }> {
    return this.http.post<{ id: string; success: boolean; letterGrade?: string }>(
      this.baseUrl,
      payload,
    );
  }

  postBatchGrades(
    payloads: GradePayload[],
  ): Observable<BatchGradeResponse> {
    return this.http.post<BatchGradeResponse>(
      `${this.baseUrl}/batch`,
      payloads,
    );
  }
}

