import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { assertWalletInvariant, holdFee, releaseFee, spendHeldFee, txFee } from '../utils/credit';
import { loadPersistedState, resetPersistedState, savePersistedState } from '../utils/storage';
import type { AppStateData, Handover, Item, Transaction } from '../types/domain';
import { canTransition, transitionTransaction } from '../utils/transaction';

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

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ username: string; password: string }>) {
      const user = state.users.find(
        (item) =>
          item.username === action.payload.username &&
          item.password === action.payload.password &&
          item.status !== 'locked',
      );
      state.currentUserId = user?.status === 'active' ? user.id : null;
    },
    logout(state) {
      state.currentUserId = null;
    },
    register(
      state,
      action: PayloadAction<{
        name: string;
        username: string;
        password: string;
        district: string;
        phone: string;
      }>,
    ) {
      const id = `user_${Date.now()}`;
      state.users.push({
        id,
        username: action.payload.username,
        password: action.payload.password,
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
        totalCredit: 20,
        availableCredit: 20,
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
    addItem(state, action: PayloadAction<Omit<Item, 'id' | 'postedAt' | 'expiresAt' | 'status'>>) {
      const now = new Date();
      const exp = new Date(now);
      exp.setMonth(exp.getMonth() + 2);
      state.items.unshift({
        ...action.payload,
        id: `item_${Date.now()}`,
        status: 'pending',
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
      item.status = 'pending';
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
      item.status = 'pending';
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
      action: PayloadAction<{ itemId: string; status: Item['status']; adminId: string }>,
    ) {
      const item = state.items.find((entry) => entry.id === action.payload.itemId);
      if (!item || !activeAdmin(state, action.payload.adminId)) return;
      item.status = action.payload.status;
      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
        adminId: action.payload.adminId,
        action: `${action.payload.status}_listing`,
        targetType: 'item',
        targetId: item.id,
        detail: `Cập nhật trạng thái bài đăng: ${item.title}`,
        createdAt: new Date().toISOString(),
      });
    },
    createTransaction(state, action: PayloadAction<{ itemId: string; requesterId: string }>) {
      const item = state.items.find((entry) => entry.id === action.payload.itemId);
      if (
        !item ||
        item.ownerId === action.payload.requesterId ||
        item.status !== 'approved' ||
        !activeActor(state, action.payload.requesterId)
      )
        return;
      const tx: Transaction = {
        id: uniqueId('tx'),
        itemId: item.id,
        requesterId: action.payload.requesterId,
        ownerId: item.ownerId,
        type: item.type,
        feeCredit: txFee(state),
        status: 'NEGOTIATING',
        creditHeldBy: [],
        senderConfirmed: false,
        receiverConfirmed: false,
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
        lastMessage: 'Đề xuất giao dịch đã được tạo.',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      });
      state.messages.push({
        id: uniqueId('msg'),
        convId,
        sender: 'system',
        type: 'system',
        text: 'Đề xuất giao dịch đã được tạo.',
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
      const id = uniqueId('ho');
      state.handovers.push({ ...action.payload, id, status: 'proposed' });
      tx.handoverId = id;
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
    },
    holdTransactionFee(state, action: PayloadAction<{ transactionId: string; userId: string }>) {
      const transaction = state.transactions.find(
        (entry) => entry.id === action.payload.transactionId,
      );
      if (!transaction || !participant(state, transaction, action.payload.userId)) return;
      holdFee(state, action.payload.transactionId, action.payload.userId);
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
      const requiredPayers = tx.type === 'trade' ? [tx.ownerId, tx.requesterId] : [tx.requesterId];
      if (!requiredPayers.every((payerId) => tx.creditHeldBy.includes(payerId))) return;
      if (action.payload.userId === tx.ownerId) {
        if (tx.senderConfirmed) return;
        if (!canTransition(tx, tx.receiverConfirmed ? 'COMPLETED' : 'SENDER_CONFIRMED')) return;
        tx.senderConfirmed = true;
        tx.senderEvidence = action.payload.evidence ?? [];
        if (tx.receiverConfirmed) {
          if (!spendHeldFee(state, tx.id)) {
            tx.senderConfirmed = false;
            tx.senderEvidence = [];
          }
        } else transitionTransaction(tx, 'SENDER_CONFIRMED');
      } else {
        if (tx.receiverConfirmed) return;
        if (!canTransition(tx, tx.senderConfirmed ? 'COMPLETED' : 'RECEIVER_CONFIRMED')) return;
        tx.receiverConfirmed = true;
        tx.receiverEvidence = action.payload.evidence ?? [];
        if (tx.senderConfirmed) {
          if (!spendHeldFee(state, tx.id)) {
            tx.receiverConfirmed = false;
            tx.receiverEvidence = [];
          }
        } else transitionTransaction(tx, 'RECEIVER_CONFIRMED');
      }
    },
    cancelTransaction(state, action: PayloadAction<{ transactionId: string; actorId: string }>) {
      const tx = state.transactions.find((entry) => entry.id === action.payload.transactionId);
      if (!tx || !participant(state, tx, action.payload.actorId)) return;
      releaseFee(state, action.payload.transactionId);
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
        action.payload.vnd <= 0 ||
        action.payload.vnd % 1000 !== 0
      )
        return;
      const amount = action.payload.vnd / 1000;
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
        amount,
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
        topup.vnd % 1000 !== 0 ||
        topup.amount !== topup.vnd / 1000 ||
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
        type: 'TOPUP',
        amount: topup.amount,
        balance: user.availableCredit,
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
        type: 'ADMIN_ADJUSTMENT',
        amount: action.payload.amount,
        balance: user.availableCredit,
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
