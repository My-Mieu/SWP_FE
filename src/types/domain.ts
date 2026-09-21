export type Role = 'guest' | 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'locked';
export type ItemType = 'gift' | 'trade';
export type ItemCondition = 'new' | 'good' | 'used';
export type ItemStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'removed';
export type TransactionStatus =
  | 'NEGOTIATING'
  | 'SCHEDULE_PROPOSED'
  | 'SCHEDULE_CONFIRMED'
  | 'CREDIT_HELD'
  | 'WAITING_HANDOVER'
  | 'SENDER_CONFIRMED'
  | 'RECEIVER_CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';
export type CreditHistoryType =
  | 'TOPUP'
  | 'SPEND'
  | 'HOLD'
  | 'REFUND'
  | 'AI_SPEND'
  | 'RELEASE_HOLD'
  | 'ADMIN_ADJUSTMENT';
export type CreditHistoryStatus = 'completed' | 'holding' | 'refunded' | 'pending';
export type KeywordAction = 'flag' | 'block';
export type ComplaintStatus = 'received' | 'processing' | 'resolved';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  avatarInitials: string;
  avatarUrl?: string;
  totalCredit: number;
  availableCredit: number;
  holdCredit: number;
  rewardPoints: number;
  reputationStars: number;
  rank: string;
  status: UserStatus;
  role: 'user' | 'admin';
  joinedAt: string;
  totalTx: number;
}

export interface Item {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: ItemType;
  category: string;
  condition: ItemCondition;
  district: string;
  images: string[];
  tradeFor?: string;
  status: ItemStatus;
  postedAt: string;
  expiresAt: string;
}

export interface Handover {
  id: string;
  transactionId: string;
  date: string;
  time: string;
  district: string;
  address: string;
  method: 'Gặp trực tiếp' | 'Giao hàng';
  note?: string;
  proposedBy: string;
  agreedBy?: string;
  status: 'proposed' | 'confirmed';
}

export interface Transaction {
  id: string;
  itemId: string;
  sourceItemId?: string;
  requesterId: string;
  ownerId: string;
  type: ItemType;
  feeCredit?: number;
  status: TransactionStatus;
  handoverId?: string;
  creditHeldBy: string[];
  creditHeld?: boolean;
  feeCaptured?: boolean;
  ownerScheduleConfirmed?: boolean;
  requesterScheduleConfirmed?: boolean;
  completedByOwner?: boolean;
  completedByRequester?: boolean;
  senderConfirmed: boolean;
  receiverConfirmed: boolean;
  ownerEvidence?: string[];
  requesterEvidence?: string[];
  senderEvidence?: string[];
  receiverEvidence?: string[];
  completedAt?: string;
  complaintDeadline?: string;
  cancelledAt?: string;
  disputeId?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  transactionId: string;
  participantIds: string[];
  itemId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  convId: string;
  sender: string | 'system';
  type: 'chat' | 'system' | 'handover_card';
  text?: string;
  handoverId?: string;
  time: string;
}

export interface CreditHistory {
  id: string;
  userId: string;
  transactionId: string;
  type: CreditHistoryType;
  amount: number;
  balance: number;
  description: string;
  status: CreditHistoryStatus;
  relatedTransactionId?: string;
  ref?: string;
  note: string;
  createdAt: string;
}

export interface Topup {
  id: string;
  code: string;
  userId: string;
  amount: number;
  vnd: number;
  method: string;
  status: 'pending' | 'confirming' | 'completed' | 'failed';
  createdAt: string;
  confirmedAt?: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  reporterId: string;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved' | 'closed';
  resolution?: string;
  adminNote?: string;
  createdAt: string;
}

export interface ForbiddenKeyword {
  id: string;
  keyword: string;
  detections: number;
  action: KeywordAction;
}

export interface SupportedDistrict {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface Complaint {
  id: string;
  reporterId: string;
  reportedUserId: string;
  transactionId: string;
  reason: string;
  content: string;
  evidence: string[];
  createdAt: string;
  status: ComplaintStatus;
  adminNote?: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface AiUsageCounter {
  id: string;
  userId: string;
  feature: 'SWAP_MATCHING' | 'ASSISTANT_SEARCH';
  periodKey: string;
  count: number;
}

export interface RankRule {
  id: string;
  name: string;
  minPoints: number;
  maxPoints?: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: 'user' | 'item' | 'transaction' | 'dispute' | 'setting' | 'keyword' | 'district' | 'complaint' | 'rank';
  targetId: string;
  detail: string;
  createdAt: string;
}

export interface SystemSetting {
  key: string;
  value: string | number;
  label: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AppStateData {
  currentUserId: string | null;
  systemRevenue: number;
  users: User[];
  items: Item[];
  transactions: Transaction[];
  handovers: Handover[];
  conversations: Conversation[];
  messages: Message[];
  creditHistory: CreditHistory[];
  topups: Topup[];
  disputes: Dispute[];
  keywords: ForbiddenKeyword[];
  districts: SupportedDistrict[];
  complaints: Complaint[];
  aiUsage: AiUsageCounter[];
  ranks: RankRule[];
  auditLogs: AdminAuditLog[];
  settings: SystemSetting[];
}
