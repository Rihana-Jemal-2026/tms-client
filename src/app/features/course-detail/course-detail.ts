import { Component, input, effect, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

interface ModuleSection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  items: string[];
  isOpen: boolean;
}

@Component({
  selector: "app-course-detail",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./course-detail.html",
  styleUrl: "./course-detail.scss",
})
export class CourseDetailComponent {
  id = input.required<string>();

  activeTab = signal<"syllabus" | "prereqs" | "reviews">("syllabus");

  modules = signal<ModuleSection[]>([
    {
      id: 1,
      title: "Consensus Protocols & Coordination",
      subtitle: "Paxos, Raft, and Byzantine Fault Tolerance",
      description:
        "Explore the fundamental problem of distributed consensus. We will implement a basic Raft leader election mechanism in Go and analyze network partition scenarios.",
      items: [
        "Formalizing the consensus problem",
        "The Raft Algorithm (Log Replication)",
        "ZooKeeper & Etcd architecture",
      ],
      isOpen: true,
    },
    {
      id: 2,
      title: "Data Replication & CAP Theorem",
      subtitle: "Consistency models and trade-offs",
      description:
        "Deep dive into Brewer's CAP Theorem and PACELC. We'll analyze modern NoSQL databases like Cassandra and DynamoDB to understand eventual vs. strong consistency.",
      items: [
        "Eventual Consistency & Vector Clocks",
        "Multi-Master Replication & Conflict Resolution",
        "Quorum Consensus Reads & Writes",
      ],
      isOpen: false,
    },
    {
      id: 3,
      title: "Distributed Storage & Sharding",
      subtitle: "Partitioning strategies and consistent hashing",
      description:
        "Learn how high-scale distributed databases shard data across thousands of nodes using consistent hashing rings and virtual nodes.",
      items: [
        "Consistent Hashing & Ring Placement",
        "LSM-Trees vs B-Trees in Storage Engines",
        "Distributed Transactions & Two-Phase Commit (2PC)",
      ],
      isOpen: false,
    },
  ]);

  prerequisites = [
    "Proficiency in Go, Rust, or C++",
    "Understanding of TCP/IP Networking & Socket Programming",
    "Basic knowledge of OS concurrency primitives (Threads, Mutexes, Channels)",
  ];

  reviews = [
    {
      author: "Abebe Alemu",
      role: "Senior Systems Engineer",
      rating: 5,
      comment: "Dr. Vance explains Raft and Byzantine fault tolerance with unparalleled clarity. The hands-on labs were top notch!",
      date: "2 weeks ago"
    },
    {
      author: "Samantha Wu",
      role: "Cloud Architect",
      rating: 5,
      comment: "Best enterprise distributed systems course available anywhere. Transformed how I design multi-region databases.",
      date: "1 month ago"
    }
  ];

  constructor() {
    effect(() => {
      console.log(`Loaded course detail for ID: ${this.id()}`);
    });
  }

  toggleModule(modId: number): void {
    this.modules.update((mods) =>
      mods.map((m) => (m.id === modId ? { ...m, isOpen: !m.isOpen } : m))
    );
  }

  setTab(tab: "syllabus" | "prereqs" | "reviews"): void {
    this.activeTab.set(tab);
  }
}
