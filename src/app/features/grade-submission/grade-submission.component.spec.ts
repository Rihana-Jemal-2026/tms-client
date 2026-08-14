import { describe, it, expect, beforeEach } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { GradeSubmissionComponent } from "./grade-submission.component";

describe("GradeSubmissionComponent", () => {
  let component: GradeSubmissionComponent;
  let fixture: ComponentFixture<GradeSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeSubmissionComponent],
      providers: [provideHttpClient(), provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(GradeSubmissionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
