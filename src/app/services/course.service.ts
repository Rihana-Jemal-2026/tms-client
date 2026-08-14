import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";
import { Course, CourseDetail, PagedResponse } from "../models/course.model";

@Injectable({
  providedIn: "root",
})
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = "/api/courses";

  private fallbackCourses: Course[] = [
    {
      id: 101,
      code: "CS101",
      title: "Modern Web Development with Angular 22",
      maxCapacity: 30,
      enrollmentCount: 18,
    },
    {
      id: 102,
      code: "CS202",
      title: "Reactive State Management with SignalStore",
      maxCapacity: 25,
      enrollmentCount: 22,
    },
    {
      id: 103,
      code: "CS303",
      title: "Defensive RxJS & Real-Time SignalR Sync",
      maxCapacity: 20,
      enrollmentCount: 20,
    },
    {
      id: 104,
      code: "CS404",
      title: "Enterprise Grid & Performance Optimization",
      maxCapacity: 35,
      enrollmentCount: 14,
    },
  ];

  getAll() {
    return this.http
      .get<PagedResponse<Course>>(this.baseUrl, {
        params: { page: "1", pageSize: "50" },
      })
      .pipe(
        map((p) => p.items),
        catchError(() => of(this.fallbackCourses)),
      );
  }

  getById(id: string) {
    return this.http.get<CourseDetail>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.fallbackCourses.find((c) => c.id === Number(id));
        return of({
          id: Number(id),
          code: found?.code || `CS${id}`,
          title: found?.title || "Advanced Web Development",
          maxCapacity: found?.maxCapacity || 30,
          enrollmentCount: found?.enrollmentCount || 15,
          links: [
            { href: `/api/courses/${id}/enroll`, rel: "enroll", method: "POST" },
          ],
        } as CourseDetail);
      }),
    );
  }
}
