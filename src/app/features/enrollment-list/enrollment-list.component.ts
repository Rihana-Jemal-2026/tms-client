import { Component, inject, signal, computed, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EnrollmentStore } from "../../store/enrollment.store";

export interface DisplayEnrollment {
  id: string;
  studentName: string;
  studentId: string;
  avatar: string;
  courseCode: string;
  courseName: string;
  submissionDate: string;
  status: "Pending" | "Approved" | "Rejected";
  isSelected?: boolean;
}

@Component({
  selector: "tms-enrollment-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./enrollment-list.component.html",
  styleUrl: "./enrollment-list.component.scss",
})
export class EnrollmentListComponent implements OnInit {
  @Input() embedded: boolean = false;

  store = inject(EnrollmentStore);

  activeTab = signal<"all" | "pending" | "approved" | "rejected">("pending");
  searchQuery = signal<string>("");
  selectAllChecked = signal<boolean>(false);

  mockEnrollments: DisplayEnrollment[] = [
    {
      id: "ENV-101",
      studentName: "Abebe Alemu",
      studentId: "STU-1001",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdEf1Kf8oCZ5FvCvJCH3vqDYcxjITdA0Ce50QRv6Ral-07KSl4IqMIHK3ut7YhACG-TQUOByz1nPy8wDfinMb_uwJLdlhWKwGdyOCO_V5R5DbOV2lomRUDIQ27DLkumloeT9qFNMXCrr-RVeB2iMkDu-wNyye4Z_GsCeXtRdm7psqHbJl28q_yREOrlIGqP4kf5LgIEUnhFpM7Dbuzi4djn_5h7ez70V-aOqayN0TBo_HKF1UliBTBuw",
      courseCode: "CS-501",
      courseName: "Enterprise Distributed Systems",
      submissionDate: "Oct 24, 2026",
      status: "Pending",
      isSelected: false,
    },
    {
      id: "ENV-102",
      studentName: "Alemu Tadesse",
      studentId: "STU-1002",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMozR09GwrXUNv8cpm5U9O8nZvT_CUNMLtIYCIRHWMk1WM-fhBdO6Xnqu48nGk1R6x-7aECVpTlHbcBbcGwF74SMk9uXyizGO_2YQUvPUIfiP8LcToSIOu5HBsco1Wuw4Z5CvLd_zU03KfQgjbHBpEyl6MCBzV6yiw_3sJSxgx_6aQ1Dfbrkz-RscELwmAxHeYzzji1ouMsazyFhfs1uTsIHlRkaztn_JK7fCULus2FWQUSvECMG5WtA",
      courseCode: "SEC-402",
      courseName: "Advanced Threat Modeling",
      submissionDate: "Oct 24, 2026",
      status: "Pending",
      isSelected: false,
    },
    {
      id: "ENV-103",
      studentName: "Rihana Mohammed",
      studentId: "STU-1003",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEEyf2un2__DBpS_Fmlc2sgQTpzgvLepFFXAb-OJi_E7rdPGgvGUtuTyf60m5nWIG_-YbHJTugu-dblRcBAH8GByThnsMOFU9U6yx8hlZSNoIDjsfwoh-7n4dnX2FtEbRtHOkU4UuAmflQt9GNh8U93BflLs0GY6A25pFYLHxRwLbGUxoq3Z6Kx-4mbm3hgYiXAP8M1uGSq9DnmPiPaF-Bh6gGkACPwFXRZ3znj6rsb7mSfQf47HysNw",
      courseCode: "AI-600",
      courseName: "Neural Network Architectures",
      submissionDate: "Oct 23, 2026",
      status: "Approved",
      isSelected: false,
    },
  ];

  enrollmentsList = signal<DisplayEnrollment[]>(this.mockEnrollments);

  allEnrollmentsMerged = computed(() => {
    const storeEntities = this.store.entities();
    const currentList = [...this.enrollmentsList()];

    // Add any store entities not already in list
    for (const ent of storeEntities) {
      const exists = currentList.some((item) => String(item.id) === String(ent.id));
      if (!exists) {
        currentList.unshift({
          id: String(ent.id),
          studentName: ent.studentName || "Abebe Alemu",
          studentId: `STU-${ent.studentId || 1001}`,
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdEf1Kf8oCZ5FvCvJCH3vqDYcxjITdA0Ce50QRv6Ral-07KSl4IqMIHK3ut7YhACG-TQUOByz1nPy8wDfinMb_uwJLdlhWKwGdyOCO_V5R5DbOV2lomRUDIQ27DLkumloeT9qFNMXCrr-RVeB2iMkDu-wNyye4Z_GsCeXtRdm7psqHbJl28q_yREOrlIGqP4kf5LgIEUnhFpM7Dbuzi4djn_5h7ez70V-aOqayN0TBo_HKF1UliBTBuw",
          courseCode: ent.courseName ? ent.courseName.slice(0, 6) : "CS-101",
          courseName: ent.courseName || "General Course",
          submissionDate: ent.submittedAt ? new Date(ent.submittedAt).toLocaleDateString() : "Today",
          status: ent.status || "Pending",
          isSelected: false,
        });
      }
    }

    return currentList;
  });

  filteredEnrollments = computed(() => {
    let list = this.allEnrollmentsMerged();
    const tab = this.activeTab();
    if (tab !== "all") {
      list = list.filter((e) => e.status.toLowerCase() === tab);
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (e) =>
          e.studentName.toLowerCase().includes(q) ||
          e.studentId.toLowerCase().includes(q) ||
          e.courseCode.toLowerCase().includes(q) ||
          e.courseName.toLowerCase().includes(q)
      );
    }
    return list;
  });

  allCount = computed(() => this.allEnrollmentsMerged().length);
  pendingCount = computed(
    () => this.allEnrollmentsMerged().filter((e) => e.status === "Pending").length
  );
  approvedCount = computed(
    () => this.allEnrollmentsMerged().filter((e) => e.status === "Approved").length
  );
  rejectedCount = computed(
    () => this.allEnrollmentsMerged().filter((e) => e.status === "Rejected").length
  );

  ngOnInit(): void {
    this.store.loadEnrollments();
  }

  setTab(tab: "all" | "pending" | "approved" | "rejected"): void {
    this.activeTab.set(tab);
  }

  updateSearch(query: string): void {
    this.searchQuery.set(query);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAllChecked.set(checked);
    this.enrollmentsList.update((items) =>
      items.map((item) => ({ ...item, isSelected: checked }))
    );
  }

  toggleItemSelect(item: DisplayEnrollment): void {
    item.isSelected = !item.isSelected;
  }

  approve(item: DisplayEnrollment): void {
    item.status = "Approved";
    this.store.approveEnrollment(item.id);
  }

  reject(item: DisplayEnrollment): void {
    item.status = "Rejected";
    this.store.rejectEnrollment(item.id);
  }

  bulkApprove(): void {
    this.enrollmentsList.update((items) =>
      items.map((item) => {
        if (item.isSelected && item.status === "Pending") {
          this.store.approveEnrollment(item.id);
          return { ...item, status: "Approved" as const };
        }
        return item;
      })
    );
  }
}
