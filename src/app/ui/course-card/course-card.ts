import { Component, Input, Output, EventEmitter } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Course } from "../../models/course.model";

@Component({
  selector: "tms-course-card",
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card">
      <h3>
        <a [routerLink]="['/courses', course?.id]">{{ course?.title }}</a>
        <span class="code-pill">({{ course?.code }})</span>
      </h3>
      <p>
        Enrolled {{ course?.enrollmentCount }} of {{ course?.maxCapacity }} seats
      </p>
      <div class="card-footer">
        <span
          class="badge"
          [class.closed]="(course?.enrollmentCount ?? 0) >= (course?.maxCapacity ?? 0)"
        >
          {{ (course?.enrollmentCount ?? 0) >= (course?.maxCapacity ?? 0) ? "Full" : "Accepting" }}
        </span>
        <button
          (click)="course && enrollClicked.emit(course)"
          [disabled]="(course?.enrollmentCount ?? 0) >= (course?.maxCapacity ?? 0)"
        >
          Enroll
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
  `],
})
export class CourseCardComponent {
  @Input() course?: Course;
  @Output() enrollClicked = new EventEmitter<Course>();
}
