import { computed, inject } from "@angular/core";
import {
  signalStore,
  withComputed,
  withMethods,
  patchState,
  withState,
} from "@ngrx/signals";
import {
  withEntities,
  setAllEntities,
  updateEntity,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, concatMap, switchMap, tap, catchError, EMPTY } from "rxjs";
import { EnrollmentService } from "../services/enrollment.service";
import { LiveSyncService } from "../services/live-sync.service";
import { Enrollment } from "../models/enrollment.model";

export const EnrollmentStore = signalStore(
  { providedIn: "root" },
  // withState adds simple properties alongside the entity collection
  withState({ isLoading: false, error: null as string | null }),
  // withEntities creates an O(1) ID-indexed dictionary for the enrollment collection.
  withEntities<Enrollment>(),
  // withComputed creates read-only derived signals that update automatically.
  withComputed((store) => ({
    pendingCount: computed(
      () => store.entities().filter((e) => e.status === "Pending").length,
    ),
  })),
  withMethods((store) => {
    const api = inject(EnrollmentService);
    const sync = inject(LiveSyncService);

    return {
      // Listens to SignalR live sync stream and updates store state automatically
      listenForLiveUpdates: rxMethod<void>(
        pipe(
          tap(() => sync.connect()),
          switchMap(() => sync.events$),
          tap((event) => {
            const targetId = String(event.id);
            const found = store
              .entities()
              .find(
                (e) =>
                  String(e.id) === targetId ||
                  String(e.studentId) === targetId,
              );
            const entityId = found ? found.id : event.id;

            patchState(
              store,
              updateEntity({
                id: entityId,
                changes: { status: event.status },
              }),
            );
          }),
        ),
      ),
      // Loading Data
      loadEnrollments: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          concatMap(() =>
            api.getAll().pipe(
              tap((rows: Enrollment[]) =>
                patchState(store, setAllEntities(rows), { isLoading: false }),
              ),
              catchError((err: any) => {
                patchState(store, {
                  isLoading: false,
                  error: err?.message || "Error loading enrollments",
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
      // Optimistic Approve
      approveEnrollment: rxMethod<string>(
        pipe(
          tap((id: string) => {
            const found = store
              .entities()
              .find(
                (e) =>
                  String(e.id) === String(id) ||
                  String(e.studentId) === String(id),
              );
            const entityId = found ? found.id : id;

            // Optimistic update — the UI reacts before the network round-trip completes
            patchState(
              store,
              updateEntity({ id: entityId, changes: { status: "Approved" } }),
            );
          }),
          concatMap((id: string) =>
            api.approve(id).pipe(
              catchError((err: any) => {
                const found = store
                  .entities()
                  .find(
                    (e) =>
                      String(e.id) === String(id) ||
                      String(e.studentId) === String(id),
                  );
                const entityId = found ? found.id : id;

                // Server rejected — restore previous status & show error
                patchState(
                  store,
                  updateEntity({ id: entityId, changes: { status: "Pending" } }),
                );
                patchState(store, {
                  error:
                    "Server rejected the approval. Check enrollment constraints.",
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    };
  }),
);
