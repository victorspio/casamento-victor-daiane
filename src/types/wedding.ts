// ─── Guest Types ───────────────────────────────────────────────────────────────

export type RsvpStatus = 'confirmed' | 'pending' | 'declined';

export interface Guest {
  id: string;
  name: string;
  group: string;
  status: RsvpStatus;
  plusOne: boolean;
  tableNumber?: number;
}

export interface GuestSummary {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

// ─── Task Types ────────────────────────────────────────────────────────────────

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface WeddingTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // ISO 8601
  category: string;
  assignee?: string;
}

// ─── Budget Types ──────────────────────────────────────────────────────────────

export type BudgetCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'music'
  | 'decor'
  | 'attire'
  | 'other';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  description: string;
  estimatedValue: number;
  paidValue: number;
  isPaid: boolean;
  vendor?: string;
  dueDate?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalCommitted: number;
  totalPaid: number;
  remaining: number;
  percentageCommitted: number;
  percentagePaid: number;
}

// ─── Vendor Types ──────────────────────────────────────────────────────────────

export type VendorStatus = 'contracted' | 'negotiating' | 'prospect' | 'declined';

export interface Vendor {
  id: string;
  name: string;
  category: BudgetCategory;
  status: VendorStatus;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contractValue?: number;
  notes?: string;
}

// ─── Timeline Types ────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  time: string; // e.g., "16:00"
  title: string;
  description?: string;
  duration?: number; // in minutes
  location?: string;
}

// ─── Wedding Config ────────────────────────────────────────────────────────────

export interface WeddingConfig {
  groom: string;
  bride: string;
  weddingDate: string; // ISO 8601
  venue: string;
  city: string;
  targetBudget?: number;
}

// ─── Dashboard Types ───────────────────────────────────────────────────────────

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface DashboardData {
  groom: string;
  bride: string;
  weddingDate: string; // ISO 8601
  venue: string;
  city: string;
  countdown: CountdownData;
  guestSummary: GuestSummary;
  topTasks: WeddingTask[];
  budgetSummary: BudgetSummary;
  recentVendors: Vendor[];
}
