import { describe, it, expect, beforeEach } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { InstructorDashboardComponent } from "./instructor-dashboard.component";

describe("InstructorDashboardComponent", () => {
  let component: InstructorDashboardComponent;
  let fixture: ComponentFixture<InstructorDashboardComponent>;

  beforeEach(async () => {
    if (typeof window !== 'undefined' && !window.IntersectionObserver) {
      (window as any).IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }

    await TestBed.configureTestingModule({
      imports: [InstructorDashboardComponent],
      providers: [provideHttpClient(), provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructorDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
