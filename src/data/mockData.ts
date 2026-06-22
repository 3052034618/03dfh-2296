import type {
  Complaint,
  Customer,
  StaffMember,
  ComplaintTagOption,
  DailyStats,
  ProjectStat,
  StaffStat,
  RankingItem,
  InvolvedStaffRecord,
} from '@/types/complaint';

export const complaintTagOptions: ComplaintTagOption[] = [
  { value: 'effect_unsatisfied', label: '效果不满意', color: '#EF4444' },
  { value: 'recovery_misunderstanding', label: '恢复期误解', color: '#F97316' },
  { value: 'service_attitude', label: '服务态度', color: '#F59E0B' },
  { value: 'price_dispute', label: '价格争议', color: '#3B82F6' },
  { value: 'other', label: '其他', color: '#6B7280' },
];

export const mockCustomers: Customer[] = [
  {
    id: 'c001',
    name: '王晓雅',
    phone: '138****8821',
    avatar: 'https://picsum.photos/id/64/200/200',
    memberLevel: '金卡会员',
    lastVisitDate: '2026-06-20',
    totalConsumption: 58600,
  },
  {
    id: 'c002',
    name: '李美琳',
    phone: '139****6612',
    avatar: 'https://picsum.photos/id/91/200/200',
    memberLevel: '钻石会员',
    lastVisitDate: '2026-06-21',
    totalConsumption: 128900,
  },
  {
    id: 'c003',
    name: '张思琪',
    phone: '136****3345',
    avatar: 'https://picsum.photos/id/177/200/200',
    memberLevel: '银卡会员',
    lastVisitDate: '2026-06-18',
    totalConsumption: 18600,
  },
  {
    id: 'c004',
    name: '刘诗雨',
    phone: '137****7789',
    avatar: 'https://picsum.photos/id/338/200/200',
    memberLevel: '金卡会员',
    lastVisitDate: '2026-06-19',
    totalConsumption: 45200,
  },
  {
    id: 'c005',
    name: '陈雨萱',
    phone: '135****2234',
    avatar: 'https://picsum.photos/id/1027/200/200',
    memberLevel: '普通会员',
    lastVisitDate: '2026-06-15',
    totalConsumption: 6800,
  },
];

export const mockStaff: StaffMember[] = [
  {
    id: 's001',
    name: '刘咨询师',
    role: 'consultant',
    avatar: 'https://picsum.photos/id/1/200/200',
  },
  {
    id: 's002',
    name: '王医生',
    role: 'doctor',
    avatar: 'https://picsum.photos/id/2/200/200',
  },
  {
    id: 's003',
    name: '陈护士',
    role: 'nurse',
    avatar: 'https://picsum.photos/id/3/200/200',
  },
  {
    id: 's004',
    name: '张咨询师',
    role: 'consultant',
    avatar: 'https://picsum.photos/id/6/200/200',
  },
  {
    id: 's005',
    name: '李医生',
    role: 'doctor',
    avatar: 'https://picsum.photos/id/8/200/200',
  },
];

export const mockComplaints: Complaint[] = [
  {
    id: 'cp001',
    customerId: 'c001',
    customer: mockCustomers[0],
    tags: ['effect_unsatisfied', 'recovery_misunderstanding'],
    customerStatement:
      '顾客表示做完双眼皮手术后两周，感觉双眼皮宽度不一致，左眼比右眼宽，而且消肿速度比预期慢很多，担心手术失败。同时对术后护理指导不够详细有意见。',
    photos: [
      {
        id: 'p001',
        url: 'https://picsum.photos/id/1027/300/300',
        light: '自然光',
        angle: '正面',
        photographer: '张护士长',
        remark: '术后14天，双眼对称度对比',
      },
    ],
    involvedStaff: [
      { staff: mockStaff[1], called: true, callTime: '2026-06-22 09:35', supplementNote: '确认术后恢复属正常范围，建议复诊观察' },
      { staff: mockStaff[2], called: true, callTime: '2026-06-22 09:40', supplementNote: '补充护理记录，已提供修复方案' },
    ],
    compensation: {
      maxRefund: 3000,
      freeItems: ['术后护理复诊2次', '精华导入护理1次'],
      discount: 0,
      gifts: ['医用修复面膜一盒'],
    },
    steps: [
      { key: 'appease', label: '先安抚', completed: true },
      { key: 'recheck', label: '再复诊', completed: true },
      { key: 'discuss', label: '再谈赔付', completed: false },
    ],
    customerConfirmed: false,
    needCallback: true,
    callbackDate: '2026-06-22',
    status: 'processing',
    createTime: '2026-06-22 09:30:00',
    updateTime: '2026-06-22 10:15:00',
    relatedProject: '全切双眼皮成形术',
    relatedStaffId: 's002',
  },
  {
    id: 'cp002',
    customerId: 'c002',
    customer: mockCustomers[1],
    tags: ['service_attitude'],
    customerStatement:
      '顾客反馈在做热玛吉项目过程中，护士操作手法不够轻柔，且中途设备报警后等待时间过长，没有工作人员及时解释情况，感到不被重视。',
    photos: [],
    involvedStaff: [
      { staff: mockStaff[0], called: true, callTime: '2026-06-22 11:25', supplementNote: '已致歉并解释设备情况' },
      { staff: mockStaff[2], called: false, supplementNote: '' },
    ],
    compensation: {
      maxRefund: 0,
      freeItems: ['热玛吉专项护理1次', '头部SPA放松护理1次'],
      discount: 0,
      gifts: ['品牌护肤小样套装'],
    },
    steps: [
      { key: 'appease', label: '先安抚', completed: true },
      { key: 'recheck', label: '再复诊', completed: false },
      { key: 'discuss', label: '再谈赔付', completed: false },
    ],
    customerConfirmed: false,
    needCallback: true,
    callbackDate: '2026-06-23',
    status: 'pending',
    createTime: '2026-06-22 11:20:00',
    updateTime: '2026-06-22 11:20:00',
    relatedProject: '热玛吉抗衰治疗',
    relatedStaffId: 's003',
  },
  {
    id: 'cp003',
    customerId: 'c003',
    customer: mockCustomers[2],
    tags: ['price_dispute'],
    customerStatement:
      '顾客表示做光子嫩肤前咨询时说价格是1280元一次，结算时被告知需要支付1580元，说是包含了面膜费用，但之前没有说明清楚，顾客认为存在价格欺诈。',
    photos: [],
    involvedStaff: [
      { staff: mockStaff[3], called: true, callTime: '2026-06-21 15:50', supplementNote: '承认报价时未说明面膜费用，同意退还差价' },
    ],
    compensation: {
      maxRefund: 300,
      freeItems: [],
      discount: 0,
      gifts: [],
    },
    steps: [
      { key: 'appease', label: '先安抚', completed: true },
      { key: 'recheck', label: '再复诊', completed: true },
      { key: 'discuss', label: '再谈赔付', completed: true },
    ],
    customerConfirmed: true,
    needCallback: false,
    status: 'done',
    createTime: '2026-06-21 15:45:00',
    updateTime: '2026-06-21 16:30:00',
    relatedProject: '光子嫩肤',
    relatedStaffId: 's004',
  },
  {
    id: 'cp004',
    customerId: 'c004',
    customer: mockCustomers[3],
    tags: ['effect_unsatisfied'],
    customerStatement:
      '顾客玻尿酸填充太阳穴后一个月，认为填充效果不明显，与术前沟通的预期效果差距较大，要求重新填充或退款。',
    photos: [
      {
        id: 'p002',
        url: 'https://picsum.photos/id/64/300/300',
        light: '室内冷光',
        angle: '45度侧面',
        photographer: '刘咨询师',
        remark: '填充后30天对比照',
      },
    ],
    involvedStaff: [
      { staff: mockStaff[4], called: true, callTime: '2026-06-20 14:10', supplementNote: '评估后认为可免费补打1ml' },
      { staff: mockStaff[0], called: true, callTime: '2026-06-20 14:15', supplementNote: '协助沟通补打方案，顾客基本接受' },
    ],
    compensation: {
      maxRefund: 0,
      freeItems: ['免费补打1ml同品牌玻尿酸', '术后护理包一套'],
      discount: 0,
      gifts: [],
    },
    steps: [
      { key: 'appease', label: '先安抚', completed: true },
      { key: 'recheck', label: '再复诊', completed: true },
      { key: 'discuss', label: '再谈赔付', completed: true },
    ],
    customerConfirmed: true,
    needCallback: true,
    callbackDate: '2026-06-25',
    status: 'done',
    createTime: '2026-06-20 14:00:00',
    updateTime: '2026-06-21 09:00:00',
    relatedProject: '玻尿酸太阳穴填充',
    relatedStaffId: 's005',
  },
  {
    id: 'cp005',
    customerId: 'c005',
    customer: mockCustomers[4],
    tags: ['other'],
    customerStatement: '顾客预约了上午10点的脱毛项目，但到店后等待了超过40分钟仍未安排，要求给出合理解释。',
    photos: [],
    involvedStaff: [],
    compensation: {
      maxRefund: 0,
      freeItems: ['下次到店优先安排'],
      discount: 0.9,
      gifts: [],
    },
    steps: [
      { key: 'appease', label: '先安抚', completed: true },
      { key: 'recheck', label: '再复诊', completed: false },
      { key: 'discuss', label: '再谈赔付', completed: false },
    ],
    customerConfirmed: false,
    needCallback: false,
    status: 'pending',
    createTime: '2026-06-22 10:05:00',
    updateTime: '2026-06-22 10:05:00',
    relatedProject: '冰点脱毛',
  },
];

export const mockDailyStats: DailyStats = {
  pendingCount: 2,
  processingCount: 1,
  doneCount: 2,
  totalCompensation: 3300,
};

export const mockProjectStats: ProjectStat[] = [
  { name: '眼部整形', count: 8, percentage: 28 },
  { name: '注射美容', count: 7, percentage: 24 },
  { name: '皮肤光电', count: 6, percentage: 21 },
  { name: '抗衰治疗', count: 4, percentage: 14 },
  { name: '其他项目', count: 4, percentage: 13 },
];

export const mockStaffStats: StaffStat[] = [
  { id: 's002', name: '王医生', role: '医生', complaintCount: 5, resolvedCount: 4 },
  { id: 's005', name: '李医生', role: '医生', complaintCount: 3, resolvedCount: 3 },
  { id: 's001', name: '刘咨询师', role: '咨询师', complaintCount: 4, resolvedCount: 3 },
  { id: 's004', name: '张咨询师', role: '咨询师', complaintCount: 3, resolvedCount: 2 },
  { id: 's003', name: '陈护士', role: '护士', complaintCount: 2, resolvedCount: 1 },
];

export const mockRanking: RankingItem[] = [
  { rank: 1, storeName: '朝阳旗舰店', complaintCount: 12, resolvedRate: 92, avgCompensation: 1680 },
  { rank: 2, storeName: '海淀精品店', complaintCount: 15, resolvedRate: 87, avgCompensation: 2100 },
  { rank: 3, storeName: '西城中心店（本店）', complaintCount: 18, resolvedRate: 83, avgCompensation: 1850 },
  { rank: 4, storeName: '东城形象店', complaintCount: 22, resolvedRate: 77, avgCompensation: 2450 },
  { rank: 5, storeName: '丰台社区店', complaintCount: 28, resolvedRate: 68, avgCompensation: 3200 },
];
