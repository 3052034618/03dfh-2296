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
  DailyStats,
  ProjectStat,
  StaffStat,
  RankingItem,
} from '@/types/complaint';
import {
  mockComplaints,
  mockCustomers,
  mockStaff,
  complaintTagOptions,
  mockDailyStats,
  mockProjectStats,
  mockStaffStats,
  mockRanking,
} from '@/data/mockData';

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
    involvedStaff: StaffMember[];
    compensation: Compensation;
    steps: NegotiationStep[];
  };

  setDraftCustomer: (customer: Customer | null) => void;
  toggleDraftTag: (tag: ComplaintTag) => void;
  setDraftStatement: (text: string) => void;
  addDraftPhoto: (photo: PhotoRecord) => void;
  removeDraftPhoto: (photoId: string) => void;
  toggleDraftStaff: (staff: StaffMember) => void;
  setDraftCompensation: (comp: Partial<Compensation>) => void;
  toggleDraftStep: (key: NegotiationStep['key']) => void;
  resetDraft: () => void;

  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
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

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: mockComplaints,
  customers: mockCustomers,
  staffList: mockStaff,
  tagOptions: complaintTagOptions,
  dailyStats: mockDailyStats,
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

  toggleDraftStaff: (staff) =>
    set((state) => {
      const hasStaff = state.currentDraft.involvedStaff.some((s) => s.id === staff.id);
      const involvedStaff = hasStaff
        ? state.currentDraft.involvedStaff.filter((s) => s.id !== staff.id)
        : [...state.currentDraft.involvedStaff, staff];
      return { currentDraft: { ...state.currentDraft, involvedStaff } };
    }),

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
    set((state) => ({
      complaints: [complaint, ...state.complaints],
    })),

  updateComplaintStatus: (id, status) =>
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === id ? { ...c, status, updateTime: new Date().toISOString() } : c
      ),
    })),

  confirmComplaint: (id) =>
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === id
          ? { ...c, customerConfirmed: true, status: 'done', updateTime: new Date().toISOString() }
          : c
      ),
    })),

  getComplaintById: (id) => get().complaints.find((c) => c.id === id),

  getComplaintsByStatus: (status) => {
    if (!status) return get().complaints;
    return get().complaints.filter((c) => c.status === status);
  },
}));
