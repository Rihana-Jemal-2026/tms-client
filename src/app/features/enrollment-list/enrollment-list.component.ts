import { Component, inject, signal, computed, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EnrollmentStore } from "../../store/enrollment.store";
import { AuthService } from "../../services/auth.service";

export interface DisplayEnrollment {
  id: string;
  studentName: string;
  studentId: string;
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
  auth = inject(AuthService);

  activeTab = signal<"all" | "pending" | "approved" | "rejected">("pending");
  searchQuery = signal<string>("");
  selectAllChecked = signal<boolean>(false);

  mockEnrollments: DisplayEnrollment[] = [
    {
      id: "ENV-101",
      studentName: "Abebe Alemu",
      studentId: "STU-1001",
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
      courseCode: "AI-600",
      courseName: "Neural Network Architectures",
      submissionDate: "Oct 23, 2026",
      status: "Approved",
      isSelected: false,
    },
  ];

  enrollmentsList = signal<DisplayEnrollment[]>(this.mockEnrollments);

  getInitials(name: string): string {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

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
          courseCode: ent.courseName ? ent.courseName.slice(0, 6) : "CS-101",
          courseName: ent.courseName || "General Course",
          submissionDate: ent.submittedAt ? new Date(ent.submittedAt).toLocaleDateString() : "Today",
          status: ent.status || "Pending",
          isSelected: false,
        });
      }
    }

    if (!this.auth.hasRole('Instructor')) {
      const user = this.auth.currentUser();
      const userName = (user?.displayName || "").toLowerCase();
      const userEmail = (user?.email || "").toLowerCase();

      return currentList.filter((e) => {
        const name = e.studentName.toLowerCase();
        const idStr = e.studentId.toLowerCase();
        return name.includes(userName) || (userEmail && (name.includes(userEmail) || idStr.includes(userEmail)));
      });
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
