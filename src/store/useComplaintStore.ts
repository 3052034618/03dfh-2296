import { create } from 'zustand';
import type {
  Complaint,
  ComplaintStatus,
  ComplaintTag,
  Customer,
  StaffMember,
  PhotoRecord,
  Compensation,
  NegotiationStep,
  InvolvedStaffRecord,
  ProjectStat,
  StaffStat,
  RankingItem,
} from '@/types/complaint';
import {
  mockComplaints,
  mockCustomers,
  mockStaff,
  complaintTagOptions,
  mockProjectStats,
  mockStaffStats,
  mockRanking,
} from '@/data/mockData';

interface DailyStats {
  pendingCount: number;
  processingCount: number;
  doneCount: number;
  totalCompensation: number;
}

interface ComplaintState {
  complaints: Complaint[];
  customers: Customer[];
  staffList: StaffMember[];
  tagOptions: typeof complaintTagOptions;
  dailyStats: DailyStats;
  projectStats: ProjectStat[];
  staffStats: StaffStat[];
  ranking: RankingItem[];

  currentDraft: {
    customer: Customer | null;
    tags: ComplaintTag[];
    customerStatement: string;
    photos: PhotoRecord[];
    involvedStaff: InvolvedStaffRecord[];
    compensation: Compensation;
    steps: NegotiationStep[];
  };

  setDraftCustomer: (customer: Customer | null) => void;
  toggleDraftTag: (tag: ComplaintTag) => void;
  setDraftStatement: (text: string) => void;
  addDraftPhoto: (photo: PhotoRecord) => void;
  removeDraftPhoto: (photoId: string) => void;
  updateDraftPhoto: (photoId: string, fields: Partial<PhotoRecord>) => void;
  toggleDraftStaff: (staff: StaffMember) => void;
  callDraftStaff: (staffId: string) => void;
  setDraftStaffNote: (staffId: string, note: string) => void;
  setDraftCompensation: (comp: Partial<Compensation>) => void;
  toggleDraftStep: (key: NegotiationStep['key']) => void;
  resetDraft: () => void;

  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  updateComplaintStep: (id: string, key: NegotiationStep['key']) => void;
  updateComplaintCompensation: (id: string, comp: Partial<Compensation>) => void;
  updateComplaintCallback: (id: string, needCallback: boolean, callbackDate?: string) => void;
  callComplaintStaff: (complaintId: string, staffId: string) => void;
  setComplaintStaffNote: (complaintId: string, staffId: string, note: string) => void;
  confirmComplaint: (id: string) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  getComplaintsByStatus: (status?: ComplaintStatus) => Complaint[];
}

const defaultSteps: NegotiationStep[] = [
  { key: 'appease', label: '先安抚', completed: false },
  { key: 'recheck', label: '再复诊', completed: false },
  { key: 'discuss', label: '再谈赔付', completed: false },
];

const defaultCompensation: Compensation = {
  maxRefund: 0,
  freeItems: [],
  discount: 0,
  gifts: [],
};

function computeDailyStats(complaints: Complaint[]): DailyStats {
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const processing = complaints.filter((c) => c.status === 'processing').length;
  const done = complaints.filter((c) => c.status === 'done').length;
  const totalComp = complaints
    .filter((c) => c.customerConfirmed)
    .reduce((sum, c) => sum + c.compensation.maxRefund, 0);
  return { pendingCount: pending, processingCount: processing, doneCount: done, totalCompensation: totalComp };
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: mockComplaints,
  customers: mockCustomers,
  staffList: mockStaff,
  tagOptions: complaintTagOptions,
  dailyStats: computeDailyStats(mockComplaints),
  projectStats: mockProjectStats,
  staffStats: mockStaffStats,
  ranking: mockRanking,

  currentDraft: {
    customer: null,
    tags: [],
    customerStatement: '',
    photos: [],
    involvedStaff: [],
    compensation: { ...defaultCompensation },
    steps: defaultSteps.map((s) => ({ ...s })),
  },

  setDraftCustomer: (customer) =>
    set((state) => ({
      currentDraft: { ...state.currentDraft, customer },
    })),

  toggleDraftTag: (tag) =>
    set((state) => {
      const tags = state.currentDraft.tags.includes(tag)
        ? state.currentDraft.tags.filter((t) => t !== tag)
        : [...state.currentDraft.tags, tag];
      return { currentDraft: { ...state.currentDraft, tags } };
    }),

  setDraftStatement: (text) =>
    set((state) => ({
      currentDraft: { ...state.currentDraft, customerStatement: text },
    })),

  addDraftPhoto: (photo) =>
    set((state) => ({
      currentDraft: {
        ...state.currentDraft,
        photos: [...state.currentDraft.photos, photo],
      },
    })),

  removeDraftPhoto: (photoId) =>
    set((state) => ({
      currentDraft: {
        ...state.currentDraft,
        photos: state.currentDraft.photos.filter((p) => p.id !== photoId),
      },
    })),

  updateDraftPhoto: (photoId, fields) =>
    set((state) => ({
      currentDraft: {
        ...state.currentDraft,
        photos: state.currentDraft.photos.map((p) =>
          p.id === photoId ? { ...p, ...fields } : p
        ),
      },
    })),

  toggleDraftStaff: (staff) =>
    set((state) => {
      const hasStaff = state.currentDraft.involvedStaff.some((r) => r.staff.id === staff.id);
      const involvedStaff = hasStaff
        ? state.currentDraft.involvedStaff.filter((r) => r.staff.id !== staff.id)
        : [...state.currentDraft.involvedStaff, { staff, called: false, supplementNote: '' }];
      return { currentDraft: { ...state.currentDraft, involvedStaff } };
    }),

  callDraftStaff: (staffId) =>
    set((state) => ({
      currentDraft: {
        ...state.currentDraft,
        involvedStaff: state.currentDraft.involvedStaff.map((r) =>
          r.staff.id === staffId
            ? { ...r, called: true, callTime: new Date().toLocaleString('zh-CN') }
            : r
        ),
      },
    })),

  setDraftStaffNote: (staffId, note) =>
    set((state) => ({
      currentDraft: {
        ...state.currentDraft,
        involvedStaff: state.currentDraft.involvedStaff.map((r) =>
          r.staff.id === staffId ? { ...r, supplementNote: note } : r
        ),
      },
    })),

  setDraftCompensation: (comp) =>
    set((state) => ({
      currentDraft: {
        ...state.currentDraft,
        compensation: { ...state.currentDraft.compensation, ...comp },
      },
    })),

  toggleDraftStep: (key) =>
    set((state) => ({
      currentDraft: {
        ...state.currentDraft,
        steps: state.currentDraft.steps.map((s) =>
          s.key === key ? { ...s, completed: !s.completed } : s
        ),
      },
    })),

  resetDraft: () =>
    set({
      currentDraft: {
        customer: null,
        tags: [],
        customerStatement: '',
        photos: [],
        involvedStaff: [],
        compensation: { ...defaultCompensation },
        steps: defaultSteps.map((s) => ({ ...s })),
      },
    }),

  addComplaint: (complaint) =>
    set((state) => {
      const complaints = [complaint, ...state.complaints];
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  updateComplaint: (id, updates) =>
    set((state) => {
      const complaints = state.complaints.map((c) =>
        c.id === id ? { ...c, ...updates, updateTime: new Date().toLocaleString('zh-CN') } : c
      );
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  updateComplaintStatus: (id, status) =>
    set((state) => {
      const complaints = state.complaints.map((c) =>
        c.id === id ? { ...c, status, updateTime: new Date().toLocaleString('zh-CN') } : c
      );
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  updateComplaintStep: (id, key) =>
    set((state) => {
      const complaints = state.complaints.map((c) => {
        if (c.id !== id) return c;
        const steps = c.steps.map((s) =>
          s.key === key ? { ...s, completed: !s.completed } : s
        );
        return { ...c, steps, updateTime: new Date().toLocaleString('zh-CN') };
      });
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  updateComplaintCompensation: (id, comp) =>
    set((state) => {
      const complaints = state.complaints.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          compensation: { ...c.compensation, ...comp },
          updateTime: new Date().toLocaleString('zh-CN'),
        };
      });
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  updateComplaintCallback: (id, needCallback, callbackDate) =>
    set((state) => {
      const complaints = state.complaints.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          needCallback,
          callbackDate: callbackDate || c.callbackDate,
          updateTime: new Date().toLocaleString('zh-CN'),
        };
      });
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  callComplaintStaff: (complaintId, staffId) =>
    set((state) => {
      const complaints = state.complaints.map((c) => {
        if (c.id !== complaintId) return c;
        const involvedStaff = c.involvedStaff.map((r) =>
          r.staff.id === staffId
            ? { ...r, called: true, callTime: new Date().toLocaleString('zh-CN') }
            : r
        );
        return { ...c, involvedStaff, updateTime: new Date().toLocaleString('zh-CN') };
      });
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  setComplaintStaffNote: (complaintId, staffId, note) =>
    set((state) => {
      const complaints = state.complaints.map((c) => {
        if (c.id !== complaintId) return c;
        const involvedStaff = c.involvedStaff.map((r) =>
          r.staff.id === staffId ? { ...r, supplementNote: note } : r
        );
        return { ...c, involvedStaff, updateTime: new Date().toLocaleString('zh-CN') };
      });
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  confirmComplaint: (id) =>
    set((state) => {
      const complaints = state.complaints.map((c) =>
        c.id === id
          ? { ...c, customerConfirmed: true, status: 'done' as const, updateTime: new Date().toLocaleString('zh-CN') }
          : c
      );
      return { complaints, dailyStats: computeDailyStats(complaints) };
    }),

  getComplaintById: (id) => get().complaints.find((c) => c.id === id),

  getComplaintsByStatus: (status) => {
    if (!status) return get().complaints;
    return get().complaints.filter((c) => c.status === status);
  },
}));
