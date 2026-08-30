import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { patchState } from "@ngrx/signals";
import { setAllEntities } from "@ngrx/signals/entities";
import { EnrollmentStore } from "./enrollment.store";
import { Enrollment } from "../models/enrollment.model";

describe("EnrollmentStore", () => {
  let store: any;

  const mockRows: Enrollment[] = [
    { id: 1, studentId: 11, studentName: "Abeba", courseId: 101, courseName: "Intro to CS", status: "Pending", enrolledAt: "2026-08-12T10:00:00Z" },
    { id: 2, studentId: 12, studentName: "Kebede", courseId: 102, courseName: "Data Structures", status: "Approved", enrolledAt: "2026-08-12T10:05:00Z" },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EnrollmentStore],
    });
    store = TestBed.inject(EnrollmentStore);
  });

  it("verifies entities() length + first row's courseName after seeding store", () => {
    patchState(store, setAllEntities(mockRows));
    expect(store.entities()).toHaveLength(2);
    expect(store.entities()[0].courseName).toBe("Intro to CS");
  });

  it("verifies pendingCount() computed signal returns the right count", () => {
    patchState(store, setAllEntities(mockRows));
    expect(store.pendingCount()).toBe(1);
  });
});
