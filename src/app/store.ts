import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  AI_ASSISTANT_SEARCH_FEE,
  AI_SWAP_MATCHING_FEE,
  TOPUP_MIN_VND,
  CREDIT_TO_VND,
  assertWalletInvariant,
  canPayTransactionFees,
  holdAllTransactionFees,
  missingCreditMessages,
  releaseFee,
  requiredCreditForItemType,
  spendAvailableCredit,
  spendHeldFee,
  txFee,
} from '../utils/credit';
import { loadPersistedState, resetPersistedState, savePersistedState } from '../utils/storage';
import type {
  AppStateData,
  ComplaintStatus,
  Handover,
  Item,
  KeywordAction,
  RankRule,
  ReputationPointRule,
  Transaction,
} from '../types/domain';
import { canTransition, transitionTransaction } from '../utils/transaction';
import { applyReputationPointEvent, rankFor } from '../utils/reputation';
import { inspectContactMessage, contactSafetyLayer1 } from '../utils/contactSafety';
import { isPasswordHash } from '../utils/passwordSecurity';

const initialState: AppStateData = loadPersistedState();
let idSequence = 0;
const uniqueId = (prefix: string) => `${prefix}_${Date.now()}_${++idSequence}`;
const activeActor = (state: AppStateData, actorId: string) =>
  state.currentUserId === actorId &&
  state.users.some((user) => user.id === actorId && user.status === 'active');
const activeAdmin = (state: AppStateData, adminId: string) =>
  activeActor(state, adminId) &&
  state.users.some((user) => user.id === adminId && user.role === 'admin');
const participant = (state: AppStateData, tx: Transaction, actorId: string) =>
  activeActor(state, actorId) && (tx.ownerId === actorId || tx.requesterId === actorId);
const recalculateUserRanks = (state: AppStateData) => {
  state.users.forEach((user) => {
    if (user.role !== 'admin') user.rank = rankFor(user.rewardPoints, state.ranks);
  });
};
const itemApproved = (status: Item['status']) => status === 'approved' || status === 'APPROVED';
const reputationBlocked = (state: AppStateData, userId: string) =>
  state.users.find((user) => user.id === userId)?.reputationStars === 0;

const addSystemMessage = (state: AppStateData, transactionId: string, text: string) => {
  const conv = state.conversations.find((entry) => entry.transactionId === transactionId);
  if (!conv) return;
  state.messages.push({
    id: uniqueId('msg'),
    convId: conv.id,
    sender: 'system',
    type: 'system',
    text,
    time: 'Bay gio',
  });
  conv.lastMessage = text;
  conv.lastMessageAt = new Date().toISOString();
};

const mondayKey = (date = new Date()) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy.toISOString().slice(0, 10);
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ username: string; passwordHash: string }>) {
      const user = state.users.find(
        (item) =>
          item.username === action.payload.username &&
          item.password === action.payload.passwordHash &&
          item.status !== 'locked',
      );
      state.currentUserId = user?.status === 'active' ? user.id : null;
    },
    demoLogin(state, action: PayloadAction<{ username: 'user' | 'admin'; role: 'user' | 'admin' }>) {
      const user = state.users.find(
        (entry) =>
          entry.username === action.payload.username &&
          entry.role === action.payload.role &&
          entry.status === 'active',
      );
      state.currentUserId = user?.id ?? null;
    },
    logout(state) {
      state.currentUserId = null;
    },
    register(
      state,
      action: PayloadAction<{
        name: string;
        username: string;
        passwordHash: string;
        district: string;
        phone: string;
      }>,
    ) {
      const id = `user_${Date.now()}`;
      state.users.push({
        id,
        username: action.payload.username,
        password: action.payload.passwordHash,
        name: action.payload.name,
        email: `${action.payload.username}@example.com`,
        phone: action.payload.phone,
        district: action.payload.district,
        avatarInitials: action.payload.name
          .split(' ')
          .map((p) => p[0])
          .slice(-2)
          .join('')
          .toUpperCase(),
        totalCredit: 2000,
        availableCredit: 2000,
        holdCredit: 0,
        rewardPoints: 0,
        reputationStars: 5,
        rank: 'Thành viên mới',
        status: 'active',
        role: 'user',
        joinedAt: new Date().toISOString(),
        totalTx: 0,
      });
      state.currentUserId = id;
    },
    changePassword(
      state,
      action: PayloadAction<{ userId: string; currentPasswordHash: string; newPasswordHash: string }>,
    ) {
      const user = state.users.find((entry) => entry.id === action.payload.userId);
      if (
        !user ||
        state.currentUserId !== user.id ||
        !isPasswordHash(action.payload.currentPasswordHash) ||
        !isPasswordHash(action.payload.newPasswordHash) ||
        user.password !== action.payload.currentPasswordHash ||
        user.password === action.payload.newPasswordHash
      ) return;
      user.password = action.payload.newPasswordHash;
    },
    requestPasswordReset(
      state,
      action: PayloadAction<{ email: string; otpHash: string; resetId: string; resetToken: string; expiresAt: string; resendAvailableAt: string }>,
    ) {
      state.passwordReset = undefined;
      const user = state.users.find((entry) => entry.email.toLowerCase() === action.payload.email.trim().toLowerCase());
      if (!isPasswordHash(action.payload.otpHash)) return;
      state.passwordReset = {
        id: action.payload.resetId,
        email: action.payload.email.trim().toLowerCase(),
        userId: user?.id,
        otpHash: action.payload.otpHash,
        expiresAt: action.payload.expiresAt,
        resendAvailableAt: action.payload.resendAvailableAt,
        attempts: 0,
        verified: false,
        resetToken: action.payload.resetToken,
      };
    },
    resendPasswordOtp(
      state,
      action: PayloadAction<{ resetId: string; otpHash: string; expiresAt: string; resendAvailableAt: string }>,
    ) {
      const reset = state.passwordReset;
      if (!reset || reset.id !== action.payload.resetId || reset.verified || Date.now() < new Date(reset.resendAvailableAt).getTime()) return;
      if (!isPasswordHash(action.payload.otpHash)) return;
      reset.otpHash = action.payload.otpHash;
      reset.expiresAt = action.payload.expiresAt;
      reset.resendAvailableAt = action.payload.resendAvailableAt;
      reset.attempts = 0;
    },
    verifyPasswordOtp(state, action: PayloadAction<{ resetId: string; otpHash: string }>) {
      const reset = state.passwordReset;
      if (!reset || reset.id !== action.payload.resetId || reset.verified || Date.now() > new Date(reset.expiresAt).getTime() || reset.attempts >= 5) return;
      if (reset.otpHash !== action.payload.otpHash) {
        reset.attempts += 1;
        return;
      }
      reset.otpHash = '';
      reset.verified = true;
    },
    resetPassword(
      state,
      action: PayloadAction<{ resetId: string; resetToken: string; newPasswordHash: string }>,
    ) {
      const reset = state.passwordReset;
      const user = state.users.find((entry) => entry.id === reset?.userId);
      if (!reset || !user || reset.id !== action.payload.resetId || reset.resetToken !== action.payload.resetToken || !reset.verified || !isPasswordHash(action.payload.newPasswordHash)) return;
      user.password = action.payload.newPasswordHash;
      state.passwordReset = undefined;
      state.currentUserId = null;
    },
    addItem(state, action: PayloadAction<Omit<Item, 'id' | 'postedAt' | 'expiresAt' | 'status'>>) {
      if (reputationBlocked(state, action.payload.ownerId)) return;
      const now = new Date();
      const exp = new Date(now);
      exp.setMonth(exp.getMonth() + 2);
      const combined = `${action.payload.title} ${action.payload.description} ${action.payload.tradeFor ?? ''}`;
      const fixedRuleViolation = contactSafetyLayer1(combined).blocked ||
        state.keywords.some((keyword) =>
          keyword.action === 'block' && combined.toLocaleLowerCase().includes(keyword.keyword.toLocaleLowerCase()),
        ) ||
        action.payload.title.trim().length < 3 ||
        action.payload.description.trim().length < 10 ||
        !action.payload.images.length;
      state.items.unshift({
        ...action.payload,
        id: `item_${Date.now()}`,
        status: fixedRuleViolation ? 'VIOLATION' : 'PENDING_REVIEW',
        moderationReason: fixedRuleViolation
          ? 'Bài đăng không vượt qua kiểm tra tự động. Vui lòng rà soát thông tin liên hệ, nội dung và hình ảnh.'
          : undefined,
        postedAt: now.toISOString(),
        expiresAt: exp.toISOString(),
      });
    },
    updateItem(
      state,
      action: PayloadAction<{
        itemId: string;
        ownerId: string;
        changes: Pick<
          Item,
          'title' | 'description' | 'category' | 'condition' | 'district' | 'tradeFor'
        >;
      }>,
    ) {
      const item = state.items.find(
        (entry) => entry.id === action.payload.itemId && entry.ownerId === action.payload.ownerId,
      );
      if (!item) return;
      Object.assign(item, action.payload.changes);
      item.status = 'PENDING_REVIEW';
      item.rejectionReason = undefined;
    },
    removeItem(state, action: PayloadAction<{ itemId: string; ownerId: string }>) {
      const item = state.items.find(
        (entry) => entry.id === action.payload.itemId && entry.ownerId === action.payload.ownerId,
      );
      if (item) item.status = 'removed';
    },
    renewItem(state, action: PayloadAction<{ itemId: string; ownerId: string }>) {
      const item = state.items.find(
        (entry) => entry.id === action.payload.itemId && entry.ownerId === action.payload.ownerId,
      );
      if (!item) return;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 2);
      item.expiresAt = expiresAt.toISOString();
      item.status = 'PENDING_REVIEW';
    },
    updateProfile(
      state,
      action: PayloadAction<{
        userId: string;
        name: string;
        email: string;
        phone: string;
        district: string;
        avatarUrl?: string;
      }>,
    ) {
      const user = state.users.find((entry) => entry.id === action.payload.userId);
      if (!user) return;
      user.name = action.payload.name;
      user.email = action.payload.email;
      user.phone = action.payload.phone;
      user.district = action.payload.district;
      user.avatarInitials = action.payload.name
        .split(' ')
        .map((part) => part[0])
        .slice(-2)
        .join('')
        .toUpperCase();
      if (action.payload.avatarUrl) user.avatarUrl = action.payload.avatarUrl;
    },
    updateItemStatus(
      state,
      action: PayloadAction<{
        itemId: string;
        status: Item['status'];
        adminId: string;
        rejectionReason?: string;
      }>,
    ) {
      const item = state.items.find((entry) => entry.id === action.payload.itemId);
      if (!item || !activeAdmin(state, action.payload.adminId)) return;
      const rejectionReason = action.payload.rejectionReason?.trim();
      if ((action.payload.status === 'rejected' || action.payload.status === 'REJECTED') && !rejectionReason) return;
      const nextStatus = action.payload.status === 'approved' ? 'APPROVED' :
        action.payload.status === 'rejected' ? 'REJECTED' : action.payload.status;
      item.status = nextStatus;
      item.rejectionReason = nextStatus === 'REJECTED' ? rejectionReason : undefined;
      item.moderationReason = rejectionReason;
      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
        adminId: action.payload.adminId,
        action: `${action.payload.status}_listing`,
        targetType: 'item',
        targetId: item.id,
        detail: `Cập nhật trạng thái bài đăng: ${item.title}`,
        createdAt: new Date().toISOString(),
      });
      if (
        (action.payload.status === 'rejected' || action.payload.status === 'REJECTED') &&
        item.rejectionReason &&
        /vi phạm|bị cấm|cam|vi pham/i.test(item.rejectionReason)
      ) {
        applyReputationPointEvent(state, {
          userId: item.ownerId,
          key: 'content_violation',
          ref: `${item.id}:content_violation`,
        });
      }
    },
    createTransaction(
      state,
      action: PayloadAction<{ itemId: string; requesterId: string; sourceItemId?: string }>,
    ) {
      const item = state.items.find((entry) => entry.id === action.payload.itemId);
      const sourceItem = action.payload.sourceItemId
        ? state.items.find((entry) => entry.id === action.payload.sourceItemId)
        : undefined;
      if (
        !item ||
        item.ownerId === action.payload.requesterId ||
        !itemApproved(item.status) ||
        reputationBlocked(state, action.payload.requesterId) ||
        (sourceItem &&
          (sourceItem.ownerId !== action.payload.requesterId ||
            sourceItem.type !== 'trade' ||
            !itemApproved(sourceItem.status) ||
            item.type !== 'trade')) ||
        !activeActor(state, action.payload.requesterId)
      )
        return;
      const requester = state.users.find((entry) => entry.id === action.payload.requesterId);
      const requiredCredit = requiredCreditForItemType(item.type);
      const payerIdsForStart = item.type === 'trade' ? [item.ownerId, action.payload.requesterId] : [action.payload.requesterId];
      const insufficient = payerIdsForStart.some((userId) => {
        const payer = state.users.find((entry) => entry.id === userId);
        return !payer || payer.availableCredit < (userId === item.ownerId && item.type === 'trade' ? 2 : requiredCredit);
      });
      if (!requester || insufficient) {
        const message = 'Bạn không đủ Credit để thực hiện thao tác này.';
        state.auditLogs.unshift({
          id: uniqueId('log'),
          adminId: action.payload.requesterId,
          action: 'request_credit_blocked',
          targetType: 'transaction',
          targetId: item.id,
          detail: message,
          createdAt: new Date().toISOString(),
        });
        return;
      }
      const tx: Transaction = {
        id: uniqueId('tx'),
        itemId: item.id,
        sourceItemId: sourceItem?.id,
        requesterId: action.payload.requesterId,
        ownerId: item.ownerId,
        type: item.type,
        feeCredit: txFee(state),
        feeCharged: false,
        status: 'NEGOTIATING',
        creditHeldBy: [],
        creditHeld: false,
        feeCaptured: false,
        ownerScheduleConfirmed: false,
        requesterScheduleConfirmed: false,
        completedByOwner: false,
        completedByRequester: false,
        senderConfirmed: false,
        receiverConfirmed: false,
        ownerEvidence: [],
        requesterEvidence: [],
        senderEvidence: [],
        receiverEvidence: [],
        createdAt: new Date().toISOString(),
      };
      const convId = uniqueId('conv');
      state.transactions.unshift(tx);
      state.conversations.unshift({
        id: convId,
        transactionId: tx.id,
        participantIds: [tx.requesterId, tx.ownerId],
        itemId: item.id,
        lastMessage: sourceItem
          ? `Đề xuất trao đổi từ ${sourceItem.title} đã được tạo.`
          : 'Đề xuất giao dịch đã được tạo.',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      });
      state.messages.push({
        id: uniqueId('msg'),
        convId,
        sender: 'system',
        type: 'system',
        text: sourceItem
          ? `Đề xuất trao đổi từ "${sourceItem.title}" sang "${item.title}" đã được tạo.`
          : 'Đề xuất giao dịch đã được tạo.',
        time: 'Bây giờ',
      });
    },
    proposeHandover(state, action: PayloadAction<Omit<Handover, 'id' | 'status'>>) {
      const tx = state.transactions.find((entry) => entry.id === action.payload.transactionId);
      if (
        !tx ||
        !participant(state, tx, action.payload.proposedBy) ||
        !canTransition(tx, 'SCHEDULE_PROPOSED')
      )
        return;
      if (!canPayTransactionFees(state, tx)) {
        addSystemMessage(state, tx.id, missingCreditMessages(state, tx).join(' '));
        return;
      }
      const id = uniqueId('ho');
      state.handovers.push({ ...action.payload, id, status: 'proposed' });
      tx.handoverId = id;
      tx.ownerScheduleConfirmed = tx.ownerId === action.payload.proposedBy;
      tx.requesterScheduleConfirmed = tx.requesterId === action.payload.proposedBy;
      transitionTransaction(tx, 'SCHEDULE_PROPOSED');
      const conv = state.conversations.find((entry) => entry.transactionId === tx.id);
      if (conv)
        state.messages.push({
          id: uniqueId('msg'),
          convId: conv.id,
          sender: action.payload.proposedBy,
          type: 'handover_card',
          handoverId: id,
          text: 'Đề xuất lịch giao nhận',
          time: 'Bây giờ',
        });
    },
    acceptHandover(state, action: PayloadAction<{ handoverId: string; userId: string }>) {
      const ho = state.handovers.find((entry) => entry.id === action.payload.handoverId);
      const tx = state.transactions.find((entry) => entry.id === ho?.transactionId);
      if (
        !ho ||
        !tx ||
        !participant(state, tx, action.payload.userId) ||
        ho.status !== 'proposed' ||
        ho.id !== tx.handoverId ||
        ho.proposedBy === action.payload.userId ||
        !canTransition(tx, 'SCHEDULE_CONFIRMED')
      )
        return;
      ho.status = 'confirmed';
      ho.agreedBy = action.payload.userId;
      transitionTransaction(tx, 'SCHEDULE_CONFIRMED');
      tx.ownerScheduleConfirmed = true;
      tx.requesterScheduleConfirmed = true;
      if (holdAllTransactionFees(state, tx.id)) {
        applyReputationPointEvent(state, {
          userId: tx.ownerId,
          key: 'handover_confirmed_on_time',
          ref: `${tx.id}:${tx.ownerId}:handover_confirmed_on_time`,
        });
        applyReputationPointEvent(state, {
          userId: tx.requesterId,
          key: 'handover_confirmed_on_time',
          ref: `${tx.id}:${tx.requesterId}:handover_confirmed_on_time`,
        });
        addSystemMessage(state, tx.id, 'Lich da duoc xac nhan va Credit da duoc giu. Thong tin lien he da mo khoa.');
      } else {
        ho.status = 'proposed';
        ho.agreedBy = undefined;
        tx.ownerScheduleConfirmed = tx.ownerId === ho.proposedBy;
        tx.requesterScheduleConfirmed = tx.requesterId === ho.proposedBy;
        tx.status = 'SCHEDULE_PROPOSED';
        addSystemMessage(state, tx.id, missingCreditMessages(state, tx).join(' ') || 'Khong the giu Credit. Vui long kiem tra so du.');
      }
    },
    confirmTransactionSide(
      state,
      action: PayloadAction<{ transactionId: string; userId: string; evidence?: string[] }>,
    ) {
      const tx = state.transactions.find((entry) => entry.id === action.payload.transactionId);
      if (
        !tx ||
        !participant(state, tx, action.payload.userId) ||
        !['WAITING_HANDOVER', 'SENDER_CONFIRMED', 'RECEIVER_CONFIRMED'].includes(tx.status)
      )
        return;
      if (!tx.creditHeld) return;
      if (action.payload.userId === tx.ownerId) {
        if (tx.completedByOwner) return;
        if (!canTransition(tx, tx.completedByRequester ? 'COMPLETED' : 'SENDER_CONFIRMED')) return;
        tx.completedByOwner = true;
        tx.senderConfirmed = true;
        tx.ownerEvidence = action.payload.evidence ?? [];
        tx.senderEvidence = tx.ownerEvidence;
        if (tx.completedByRequester) {
          if (!spendHeldFee(state, tx.id)) {
            tx.completedByOwner = false;
            tx.senderConfirmed = false;
            tx.ownerEvidence = [];
            tx.senderEvidence = [];
          }
        } else transitionTransaction(tx, 'SENDER_CONFIRMED');
      } else {
        if (tx.completedByRequester) return;
        if (!canTransition(tx, tx.completedByOwner ? 'COMPLETED' : 'RECEIVER_CONFIRMED')) return;
        tx.completedByRequester = true;
        tx.receiverConfirmed = true;
        tx.requesterEvidence = action.payload.evidence ?? [];
        tx.receiverEvidence = tx.requesterEvidence;
        if (tx.completedByOwner) {
          if (!spendHeldFee(state, tx.id)) {
            tx.completedByRequester = false;
            tx.receiverConfirmed = false;
            tx.requesterEvidence = [];
            tx.receiverEvidence = [];
          }
        } else transitionTransaction(tx, 'RECEIVER_CONFIRMED');
      }
    },
    addKeyword(
      state,
      action: PayloadAction<{ adminId: string; keyword: string; action: KeywordAction }>,
    ) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const keyword = action.payload.keyword.trim();
      if (!keyword || state.keywords.some((entry) => entry.keyword.toLowerCase() === keyword.toLowerCase()))
        return;
      const id = uniqueId('kw');
      state.keywords.unshift({ id, keyword, detections: 0, action: action.payload.action });
      state.auditLogs.unshift({
        id: uniqueId('log'),
        adminId: action.payload.adminId,
        action: 'add_keyword',
        targetType: 'keyword',
        targetId: id,
        detail: `Thêm từ khóa cấm: ${keyword}`,
        createdAt: new Date().toISOString(),
      });
    },
    updateKeyword(
      state,
      action: PayloadAction<{ adminId: string; id: string; keyword: string; action: KeywordAction }>,
    ) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const entry = state.keywords.find((item) => item.id === action.payload.id);
      const keyword = action.payload.keyword.trim();
      if (
        !entry ||
        !keyword ||
        state.keywords.some(
          (item) => item.id !== entry.id && item.keyword.toLowerCase() === keyword.toLowerCase(),
        )
      )
        return;
      entry.keyword = keyword;
      entry.action = action.payload.action;
    },
    deleteKeyword(state, action: PayloadAction<{ adminId: string; id: string }>) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      state.keywords = state.keywords.filter((entry) => entry.id !== action.payload.id);
    },
    addDistrict(state, action: PayloadAction<{ adminId: string; name: string }>) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const name = action.payload.name.trim();
      if (!name || state.districts.some((entry) => entry.name.toLowerCase() === name.toLowerCase()))
        return;
      state.districts.push({ id: uniqueId('dist'), name, status: 'active' });
    },
    updateDistrict(state, action: PayloadAction<{ adminId: string; id: string; name: string }>) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const entry = state.districts.find((item) => item.id === action.payload.id);
      const name = action.payload.name.trim();
      if (
        !entry ||
        !name ||
        state.districts.some(
          (item) => item.id !== entry.id && item.name.toLowerCase() === name.toLowerCase(),
        )
      )
        return;
      const oldName = entry.name;
      entry.name = name;
      state.users.forEach((user) => {
        if (user.district === oldName) user.district = name;
      });
      state.items.forEach((item) => {
        if (item.district === oldName) item.district = name;
      });
      state.handovers.forEach((handover) => {
        if (handover.district === oldName) handover.district = name;
      });
    },
    deleteDistrict(state, action: PayloadAction<{ adminId: string; id: string }>) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      state.districts = state.districts.filter((entry) => entry.id !== action.payload.id);
    },
    createComplaint(
      state,
      action: PayloadAction<{
        transactionId: string;
        reporterId: string;
        reason: string;
        content: string;
        evidence: string[];
      }>,
    ) {
      const tx = state.transactions.find((entry) => entry.id === action.payload.transactionId);
      if (!tx || !participant(state, tx, action.payload.reporterId)) return;
      const now = Date.now();
      if (
        tx.status !== 'COMPLETED' ||
        !tx.complaintDeadline ||
        now > new Date(tx.complaintDeadline).getTime()
      )
        return;
      const reason = action.payload.reason.trim();
      const content = action.payload.content.trim();
      if (!reason || !content) return;
      const reportedUserId = tx.ownerId === action.payload.reporterId ? tx.requesterId : tx.ownerId;
      state.complaints.unshift({
        id: uniqueId('cmp'),
        reporterId: action.payload.reporterId,
        reportedUserId,
        transactionId: tx.id,
        reason,
        content,
        evidence: action.payload.evidence,
        createdAt: new Date().toISOString(),
        status: 'received',
      });
    },
    updateComplaintStatus(
      state,
      action: PayloadAction<{
        adminId: string;
        complaintId: string;
        status: ComplaintStatus;
        adminNote?: string;
        resolution?: string;
      }>,
    ) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const complaint = state.complaints.find((entry) => entry.id === action.payload.complaintId);
      if (!complaint) return;
      const allowed =
        (complaint.status === 'received' && action.payload.status === 'processing') ||
        (complaint.status === 'processing' &&
          (action.payload.status === 'violation_confirmed' || action.payload.status === 'rejected')) ||
        complaint.status === action.payload.status;
      if (!allowed) return;
      complaint.status = action.payload.status;
      complaint.adminNote = action.payload.adminNote ?? complaint.adminNote;
      complaint.resolution = action.payload.resolution ?? complaint.resolution;
      if (action.payload.status === 'violation_confirmed') {
        complaint.resolvedAt = new Date().toISOString();
        applyReputationPointEvent(state, {
          userId: complaint.reportedUserId,
          key: 'valid_complaint',
          ref: `${complaint.id}:valid_complaint`,
        });
      } else if (action.payload.status === 'rejected') {
        complaint.resolvedAt = new Date().toISOString();
      }
    },
    updateRankRule(
      state,
      action: PayloadAction<{
        adminId: string;
        id: string;
        name: string;
        minPoints: number;
        maxPoints?: number;
        benefits?: string;
        status?: RankRule['status'];
      }>,
    ) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const rank = state.ranks.find((entry) => entry.id === action.payload.id);
      if (!rank || !action.payload.name.trim() || action.payload.minPoints < 0) return;
      const nextRanks = state.ranks.map((entry) =>
        entry.id === rank.id
          ? {
              ...entry,
              name: action.payload.name.trim(),
              minPoints: action.payload.minPoints,
              maxPoints: action.payload.maxPoints,
              benefits: action.payload.benefits?.trim(),
              status: action.payload.status ?? 'active',
            }
          : entry,
      );
      const valid = nextRanks.every((entry, index) =>
        nextRanks.every((other, otherIndex) => {
          if (index === otherIndex) return true;
          const aMax = entry.maxPoints ?? Number.MAX_SAFE_INTEGER;
          const bMax = other.maxPoints ?? Number.MAX_SAFE_INTEGER;
          return aMax < other.minPoints || bMax < entry.minPoints;
        }),
      );
      if (!valid) return;
      Object.assign(rank, {
        name: action.payload.name.trim(),
        minPoints: action.payload.minPoints,
        maxPoints: action.payload.maxPoints,
        benefits: action.payload.benefits?.trim(),
        status: action.payload.status ?? 'active',
      });
      recalculateUserRanks(state);
    },
    addRankRule(
      state,
      action: PayloadAction<{
        adminId: string;
        name: string;
        minPoints: number;
        maxPoints?: number;
        benefits?: string;
        status?: RankRule['status'];
      }>,
    ) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const name = action.payload.name.trim();
      if (!name || action.payload.minPoints < 0) return;
      const candidate: RankRule = {
        id: uniqueId('rank'),
        name,
        minPoints: action.payload.minPoints,
        maxPoints: action.payload.maxPoints,
        benefits: action.payload.benefits?.trim(),
        status: action.payload.status ?? 'active',
      };
      const nextRanks = [...state.ranks, candidate];
      const valid = nextRanks.every((entry, index) =>
        nextRanks.every((other, otherIndex) => {
          if (index === otherIndex) return true;
          const aMax = entry.maxPoints ?? Number.MAX_SAFE_INTEGER;
          const bMax = other.maxPoints ?? Number.MAX_SAFE_INTEGER;
          return aMax < other.minPoints || bMax < entry.minPoints;
        }),
      );
      if (!valid) return;
      state.ranks.push(candidate);
      recalculateUserRanks(state);
    },
    addPointRule(
      state,
      action: PayloadAction<{
        adminId: string;
        behavior: string;
        type: ReputationPointRule['type'];
        points: number;
        status: ReputationPointRule['status'];
        description: string;
      }>,
    ) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const behavior = action.payload.behavior.trim();
      if (!behavior || action.payload.points < 0) return;
      const id = uniqueId('rule');
      state.pointRules.push({
        id,
        key: `custom_${Date.now()}` as ReputationPointRule['key'],
        behavior,
        type: action.payload.type,
        points: action.payload.points,
        status: action.payload.status,
        description: action.payload.description.trim(),
      });
      state.auditLogs.unshift({
        id: uniqueId('log'),
        adminId: action.payload.adminId,
        action: 'add_point_rule',
        targetType: 'point_rule',
        targetId: id,
        detail: `Thêm quy tắc điểm: ${behavior}`,
        createdAt: new Date().toISOString(),
      });
    },
    updatePointRule(
      state,
      action: PayloadAction<{
        adminId: string;
        id: string;
        behavior: string;
        type: ReputationPointRule['type'];
        points: number;
        status: ReputationPointRule['status'];
        description: string;
      }>,
    ) {
      if (!activeAdmin(state, action.payload.adminId)) return;
      const rule = state.pointRules.find((entry) => entry.id === action.payload.id);
      const behavior = action.payload.behavior.trim();
      if (!rule || !behavior || action.payload.points < 0) return;
      rule.behavior = behavior;
      rule.type = action.payload.type;
      rule.points = action.payload.points;
      rule.status = action.payload.status;
      rule.description = action.payload.description.trim();
      state.auditLogs.unshift({
        id: uniqueId('log'),
        adminId: action.payload.adminId,
        action: 'update_point_rule',
        targetType: 'point_rule',
        targetId: rule.id,
        detail: `Cập nhật quy tắc điểm: ${behavior}`,
        createdAt: new Date().toISOString(),
      });
    },
    cancelTransaction(state, action: PayloadAction<{ transactionId: string; actorId: string }>) {
      const tx = state.transactions.find((entry) => entry.id === action.payload.transactionId);
      if (!tx || !participant(state, tx, action.payload.actorId)) return;
      if (releaseFee(state, action.payload.transactionId)) {
        applyReputationPointEvent(state, {
          userId: action.payload.actorId,
          key: 'unreasoned_cancel',
          ref: `${tx.id}:${action.payload.actorId}:unreasoned_cancel`,
        });
      }
    },
    sendMessage(state, action: PayloadAction<{ convId: string; sender: string; text: string }>) {
      const conv = state.conversations.find((entry) => entry.id === action.payload.convId);
      const tx = state.transactions.find((entry) => entry.id === conv?.transactionId);
      if (
        !conv ||
        !tx ||
        !participant(state, tx, action.payload.sender) ||
        !conv.participantIds.includes(action.payload.sender) ||
        !action.payload.text.trim()
      )
        return;
      if (!tx.creditHeld && inspectContactMessage(action.payload.text).blocked) {
        state.messages.push({
          id: uniqueId('msg'),
          convId: action.payload.convId,
          sender: 'system',
          type: 'system',
          text: 'Không thể gửi thông tin liên hệ trước khi hai bên xác nhận lịch hẹn.',
          time: 'Bay gio',
        });
        return;
      }
      state.messages.push({
        id: uniqueId('msg'),
        convId: action.payload.convId,
        sender: action.payload.sender,
        type: 'chat',
        text: action.payload.text,
        time: 'Bây giờ',
      });
      conv.lastMessage = action.payload.text;
      conv.lastMessageAt = new Date().toISOString();
    },
    topupCredit(
      state,
      action: PayloadAction<{ userId: string; vnd: number; id?: string; code?: string }>,
    ) {
      const user = state.users.find((entry) => entry.id === action.payload.userId);
      if (!user || !activeActor(state, action.payload.userId)) return;
      if (
        !Number.isSafeInteger(action.payload.vnd) ||
        action.payload.vnd < TOPUP_MIN_VND ||
        action.payload.vnd % 1000 !== 0
      )
        return;
      const id = action.payload.id ?? uniqueId('top');
      const code = action.payload.code ?? uniqueId('SLTOPUP');
      if (
        !id.trim() ||
        !code.trim() ||
        state.topups.some((topup) => topup.id === id || topup.code === code) ||
        state.creditHistory.some((entry) => entry.ref === id)
      )
        return;
      state.topups.unshift({
        id,
        code,
        userId: user.id,
        amount: action.payload.vnd / CREDIT_TO_VND,
        vnd: action.payload.vnd,
        method: 'QR Banking',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    },
    confirmTopup(state, action: PayloadAction<{ topupId: string; adminId: string }>) {
      const topup = state.topups.find((entry) => entry.id === action.payload.topupId);
      const user = state.users.find((entry) => entry.id === topup?.userId);
      if (
        !topup ||
        !user ||
        !activeAdmin(state, action.payload.adminId) ||
        topup.status !== 'pending' ||
        !Number.isSafeInteger(topup.vnd) ||
        topup.vnd <= 0 ||
        topup.vnd < TOPUP_MIN_VND ||
        topup.vnd % 1000 !== 0 ||
        topup.amount !== topup.vnd / CREDIT_TO_VND ||
        !Number.isSafeInteger(user.totalCredit + topup.amount) ||
        !Number.isSafeInteger(user.availableCredit + topup.amount) ||
        state.creditHistory.some((entry) => entry.ref === topup.id)
      )
        return;
      topup.status = 'completed';
      topup.confirmedAt = new Date().toISOString();
      user.totalCredit += topup.amount;
      user.availableCredit += topup.amount;
      state.creditHistory.unshift({
        id: uniqueId('ch'),
        userId: user.id,
        transactionId: topup.id,
        type: 'TOPUP',
        amount: topup.amount,
        balance: user.availableCredit,
        description: 'Nạp Credit qua QR',
        status: 'completed',
        ref: topup.id,
        note: 'Nạp Credit qua QR',
        createdAt: new Date().toISOString(),
      });
      state.auditLogs.unshift({
        id: uniqueId('log'),
        adminId: action.payload.adminId,
        action: 'confirm_topup',
        targetType: 'user',
        targetId: user.id,
        detail: `Xác nhận nạp ${topup.amount} Credit`,
        createdAt: new Date().toISOString(),
      });
    },
    useAiFeature(
      state,
      action: PayloadAction<{ userId: string; feature: 'SWAP_MATCHING' | 'ASSISTANT_SEARCH' }>,
    ) {
      if (!activeActor(state, action.payload.userId)) return;
      const periodKey =
        action.payload.feature === 'SWAP_MATCHING'
          ? `week:${mondayKey()}`
          : `day:${new Date().toISOString().slice(0, 10)}`;
      let counter = state.aiUsage.find(
        (entry) =>
          entry.userId === action.payload.userId &&
          entry.feature === action.payload.feature &&
          entry.periodKey === periodKey,
      );
      if (!counter) {
        counter = {
          id: uniqueId('aiu'),
          userId: action.payload.userId,
          feature: action.payload.feature,
          periodKey,
          count: 0,
        };
        state.aiUsage.push(counter);
      }
      const fee =
        action.payload.feature === 'SWAP_MATCHING'
          ? AI_SWAP_MATCHING_FEE
          : AI_ASSISTANT_SEARCH_FEE;
      const paid = spendAvailableCredit(state, {
        userId: action.payload.userId,
        amount: fee,
        type: 'AI_SPEND',
        ref: `ai:${action.payload.feature}:${action.payload.userId}:${Date.now()}`,
        description:
          action.payload.feature === 'SWAP_MATCHING'
            ? 'Phí AI gợi ý ghép đôi Swap'
            : 'Phí AI trợ lý tìm đồ',
      });
      if (!paid) return;
      counter.count += 1;
    },
    adminAdjustCredit(
      state,
      action: PayloadAction<{
        adminId: string;
        userId: string;
        amount: number;
        note: string;
        ref: string;
      }>,
    ) {
      const user = state.users.find((entry) => entry.id === action.payload.userId);
      if (
        !user ||
        !activeAdmin(state, action.payload.adminId) ||
        !Number.isSafeInteger(action.payload.amount) ||
        action.payload.amount === 0 ||
        !Number.isSafeInteger(user.availableCredit + action.payload.amount) ||
        user.availableCredit + action.payload.amount < 0 ||
        !Number.isSafeInteger(user.totalCredit + action.payload.amount) ||
        !action.payload.ref.trim() ||
        state.creditHistory.some((entry) => entry.ref === action.payload.ref) ||
        state.topups.some((topup) => topup.id === action.payload.ref)
      )
        return;
      user.totalCredit += action.payload.amount;
      user.availableCredit += action.payload.amount;
      state.creditHistory.unshift({
        id: uniqueId('ch'),
        userId: user.id,
        transactionId: action.payload.ref,
        type: 'ADMIN_ADJUSTMENT',
        amount: action.payload.amount,
        balance: user.availableCredit,
        description: action.payload.note,
        status: 'completed',
        ref: action.payload.ref,
        note: action.payload.note,
        createdAt: new Date().toISOString(),
      });
      state.auditLogs.unshift({
        id: uniqueId('log'),
        adminId: action.payload.adminId,
        action: 'adjust_credit',
        targetType: 'user',
        targetId: user.id,
        detail: action.payload.note,
        createdAt: new Date().toISOString(),
      });
    },
    updateFeeSetting(state, action: PayloadAction<{ adminId: string; fee: number }>) {
      if (
        !activeAdmin(state, action.payload.adminId) ||
        !Number.isSafeInteger(action.payload.fee) ||
        action.payload.fee <= 0
      )
        return;
      const setting = state.settings.find((entry) => entry.key === 'tx_fee_credit');
      if (setting) {
        setting.value = action.payload.fee;
        setting.updatedAt = new Date().toISOString();
        setting.updatedBy = action.payload.adminId;
      }
      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
        adminId: action.payload.adminId,
        action: 'change_fee_setting',
        targetType: 'setting',
        targetId: 'tx_fee_credit',
        detail: `Đổi phí giao dịch thành ${action.payload.fee} Credit`,
        createdAt: new Date().toISOString(),
      });
    },
    lockUser(state, action: PayloadAction<{ adminId: string; userId: string; locked: boolean }>) {
      const user = state.users.find((entry) => entry.id === action.payload.userId);
      if (!user || user.role === 'admin' || !activeAdmin(state, action.payload.adminId)) return;
      user.status = action.payload.locked ? 'locked' : 'active';
      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
        adminId: action.payload.adminId,
        action: action.payload.locked ? 'lock_user' : 'unlock_user',
        targetType: 'user',
        targetId: user.id,
        detail: `${action.payload.locked ? 'Khóa' : 'Mở khóa'} ${user.name}`,
        createdAt: new Date().toISOString(),
      });
    },
    resetDemoData(state) {
      if (
        !state.users.some(
          (user) =>
            user.id === state.currentUserId && user.role === 'admin' && user.status === 'active',
        )
      )
        return;
      return resetPersistedState();
    },
  },
});

export const actions = dataSlice.actions;
export const dataReducer = dataSlice.reducer;
export const store = configureStore({ reducer: { data: dataSlice.reducer } });
store.subscribe(() => {
  assertWalletInvariant(store.getState().data);
  savePersistedState(store.getState().data);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const selectData = (state: RootState) => state.data;
export const selectCurrentUser = (state: RootState) =>
  state.data.users.find((user) => user.id === state.data.currentUserId) ?? null;
