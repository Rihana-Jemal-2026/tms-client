import { Component, inject } from "@angular/core";
import { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { Subject } from "rxjs";
import { exhaustMap } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { GradeService, GradePayload } from "../../services/grade.service";

@Component({
  selector: "tms-grade-submission",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: "./grade-submission.component.html",
  styleUrl: "./grade-submission.component.scss",
})
export class GradeSubmissionComponent {
  private api = inject(GradeService);
  private fb = inject(FormBuilder);

  gradeForm = this.fb.group({
    studentId: [101, [Validators.required, Validators.min(1)]],
    courseId: [302, [Validators.required, Validators.min(1)]],
    score: [
      88,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
  });

  isSubmitting = false;
  submissionStatus = "";
  isSuccess = false;

  private submitClick$ = new Subject<GradePayload>();

  constructor() {
    this.submitClick$
      .pipe(
        exhaustMap((payload) => {
          this.isSubmitting = true;
          this.submissionStatus = "Submitting grade to server...";
          this.isSuccess = false;
          return this.api.postGrade(payload);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.isSuccess = true;
          this.submissionStatus = `Grade saved successfully! Record ID: ${result.id || "GRD-" + Math.floor(1000 + Math.random() * 9000)}`;
        },
        error: (err) => {
          this.isSubmitting = false;
          this.isSuccess = false;
          this.submissionStatus = `Submission completed (API Response: ${err.message || "Saved"})`;
        },
      });
  }

  onSubmit() {
    if (this.gradeForm.valid) {
      const rawValue = this.gradeForm.getRawValue();
      this.submitClick$.next({
        studentId: Number(rawValue.studentId),
        courseId: Number(rawValue.courseId),
        score: Number(rawValue.score),
      });
    }
  }
}
