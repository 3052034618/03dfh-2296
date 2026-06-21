export type ComplaintStatus = 'pending' | 'processing' | 'done';

export type ComplaintTag =
  | 'effect_unsatisfied'
  | 'recovery_misunderstanding'
  | 'service_attitude'
  | 'price_dispute'
  | 'other';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  memberLevel: string;
  lastVisitDate: string;
  totalConsumption: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'consultant' | 'doctor' | 'nurse';
  avatar: string;
}

export interface PhotoRecord {
  id: string;
  url: string;
  light: string;
  angle: string;
  photographer: string;
  remark: string;
}

export interface Compensation {
  maxRefund: number;
  freeItems: string[];
  discount: number;
  gifts: string[];
}

export interface NegotiationStep {
  key: 'appease' | 'recheck' | 'discuss';
  label: string;
  completed: boolean;
}

export interface Complaint {
  id: string;
  customerId: string;
  customer: Customer;
  tags: ComplaintTag[];
  customerStatement: string;
  photos: PhotoRecord[];
  involvedStaff: StaffMember[];
  compensation: Compensation;
  steps: NegotiationStep[];
  customerConfirmed: boolean;
  needCallback: boolean;
  callbackDate?: string;
  status: ComplaintStatus;
  createTime: string;
  updateTime: string;
  relatedProject?: string;
  relatedStaffId?: string;
  remark?: string;
}

export interface ComplaintTagOption {
  value: ComplaintTag;
  label: string;
  color: string;
}

export interface DailyStats {
  pendingCount: number;
  processingCount: number;
  doneCount: number;
  totalCompensation: number;
}

export interface ProjectStat {
  name: string;
  count: number;
  percentage: number;
}

export interface StaffStat {
  id: string;
  name: string;
  role: string;
  complaintCount: number;
  resolvedCount: number;
}

export interface RankingItem {
  rank: number;
  storeName: string;
  complaintCount: number;
  resolvedRate: number;
  avgCompensation: number;
}
