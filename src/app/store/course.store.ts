import { inject } from "@angular/core";
import {
  signalStore,
  withMethods,
  patchState,
  withState,
} from "@ngrx/signals";
import {
  withEntities,
  setAllEntities,
  removeEntity,
} from "@ngrx/signals/entities";
import { catchError, EMPTY, tap } from "rxjs";
import { CourseService } from "../services/course.service";
import { Course } from "../models/course.model";

export const CourseStore = signalStore(
  { providedIn: "root" },
  withState({ isLoading: false, error: null as string | null }),
  withEntities<Course>(),
  withMethods((store, svc = inject(CourseService)) => ({
    loadCourses() {
      patchState(store, { isLoading: true, error: null });
      svc
        .getAll()
        .pipe(
          tap((courses) =>
            patchState(store, setAllEntities(courses), { isLoading: false }),
          ),
          catchError((err) => {
            patchState(store, {
              isLoading: false,
              error: err?.message || "Failed to load courses",
            });
            return EMPTY;
          }),
        )
        .subscribe();
    },
    deleteCourse(id: number) {
      // 1. Take snapshot of current entities BEFORE mutating local state
      const previousSnapshot = store.entities();

      // 2. Instant visual feedback — remove entity immediately from local UI
      patchState(store, removeEntity(id));

      // 3. Dispatch API call to backend server
      svc
        .delete(id)
        .pipe(
          catchError((err) => {
            // 4. Server rejected request — restore previous snapshot and set error message
            patchState(store, setAllEntities(previousSnapshot));
            patchState(store, {
              error: "Cannot delete course: active student enrollments exist.",
            });
            return EMPTY;
          }),
        )
        .subscribe();
    },
  })),
);
