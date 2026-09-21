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
  'TOPUP' | 'TRANSACTION_FEE' | 'AI_FEE' | 'HOLD' | 'RELEASE_HOLD' | 'REFUND' | 'ADMIN_ADJUSTMENT';

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
  requesterId: string;
  ownerId: string;
  type: ItemType;
  feeCredit?: number;
  status: TransactionStatus;
  handoverId?: string;
  creditHeldBy: string[];
  senderConfirmed: boolean;
  receiverConfirmed: boolean;
  senderEvidence?: string[];
  receiverEvidence?: string[];
  completedAt?: string;
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
  type: CreditHistoryType;
  amount: number;
  balance: number;
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

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: 'user' | 'item' | 'transaction' | 'dispute' | 'setting';
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
  users: User[];
  items: Item[];
  transactions: Transaction[];
  handovers: Handover[];
  conversations: Conversation[];
  messages: Message[];
  creditHistory: CreditHistory[];
  topups: Topup[];
  disputes: Dispute[];
  auditLogs: AdminAuditLog[];
  settings: SystemSetting[];
}
