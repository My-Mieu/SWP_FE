import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { assertWalletInvariant, holdFee, releaseFee, spendHeldFee, txFee } from '../utils/credit';
import { loadPersistedState, resetPersistedState, savePersistedState } from '../utils/storage';
import type { AppStateData, Handover, Item, Transaction } from '../types/domain';

const initialState: AppStateData = loadPersistedState();

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
      if (user) state.currentUserId = user.id;
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
      if (!item) return;
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
      if (!item || item.ownerId === action.payload.requesterId) return;
      const tx: Transaction = {
        id: `tx_${Date.now()}`,
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
      const convId = `conv_${Date.now()}`;
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
        id: `msg_${Date.now()}`,
        convId,
        sender: 'system',
        type: 'system',
        text: 'Đề xuất giao dịch đã được tạo.',
        time: 'Bây giờ',
      });
    },
    proposeHandover(state, action: PayloadAction<Omit<Handover, 'id' | 'status'>>) {
      const tx = state.transactions.find((entry) => entry.id === action.payload.transactionId);
      if (!tx || (tx.status !== 'NEGOTIATING' && tx.status !== 'SCHEDULE_PROPOSED')) return;
      const id = `ho_${Date.now()}`;
      state.handovers.push({ ...action.payload, id, status: 'proposed' });
      tx.handoverId = id;
      tx.status = 'SCHEDULE_PROPOSED';
      const conv = state.conversations.find((entry) => entry.transactionId === tx.id);
      if (conv)
        state.messages.push({
          id: `msg_${Date.now()}`,
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
      if (!ho || !tx || tx.status !== 'SCHEDULE_PROPOSED') return;
      ho.status = 'confirmed';
      ho.agreedBy = action.payload.userId;
      tx.status = 'SCHEDULE_CONFIRMED';
    },
    holdTransactionFee(state, action: PayloadAction<{ transactionId: string; userId: string }>) {
      const transaction = state.transactions.find(
        (entry) => entry.id === action.payload.transactionId,
      );
      if (!transaction || !['SCHEDULE_CONFIRMED', 'CREDIT_HELD'].includes(transaction.status))
        return;
      holdFee(state, action.payload.transactionId, action.payload.userId);
    },
    confirmTransactionSide(
      state,
      action: PayloadAction<{ transactionId: string; userId: string; evidence?: string[] }>,
    ) {
      const tx = state.transactions.find((entry) => entry.id === action.payload.transactionId);
      if (!tx || tx.status === 'COMPLETED') return;
      const requiredPayers = tx.type === 'trade' ? [tx.ownerId, tx.requesterId] : [tx.requesterId];
      if (!requiredPayers.every((payerId) => tx.creditHeldBy.includes(payerId))) return;
      if (action.payload.userId === tx.ownerId) {
        tx.senderConfirmed = true;
        tx.senderEvidence = action.payload.evidence ?? [];
      }
      if (action.payload.userId === tx.requesterId) {
        tx.receiverConfirmed = true;
        tx.receiverEvidence = action.payload.evidence ?? [];
      }
      if (tx.senderConfirmed && tx.receiverConfirmed) spendHeldFee(state, tx.id);
      else
        tx.status =
          action.payload.userId === tx.ownerId ? 'SENDER_CONFIRMED' : 'RECEIVER_CONFIRMED';
    },
    cancelTransaction(state, action: PayloadAction<{ transactionId: string }>) {
      releaseFee(state, action.payload.transactionId);
    },
    sendMessage(state, action: PayloadAction<{ convId: string; sender: string; text: string }>) {
      state.messages.push({
        id: `msg_${Date.now()}`,
        convId: action.payload.convId,
        sender: action.payload.sender,
        type: 'chat',
        text: action.payload.text,
        time: 'Bây giờ',
      });
      const conv = state.conversations.find((entry) => entry.id === action.payload.convId);
      if (conv) {
        conv.lastMessage = action.payload.text;
        conv.lastMessageAt = new Date().toISOString();
      }
    },
    topupCredit(
      state,
      action: PayloadAction<{ userId: string; vnd: number; id?: string; code?: string }>,
    ) {
      const user = state.users.find((entry) => entry.id === action.payload.userId);
      if (!user) return;
      const amount = action.payload.vnd / 1000;
      state.topups.unshift({
        id: action.payload.id ?? `top_${Date.now()}`,
        code: action.payload.code ?? `SLTOPUP-${String(Date.now()).slice(-6)}`,
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
      if (!topup || !user || !['pending', 'confirming'].includes(topup.status)) return;
      topup.status = 'completed';
      topup.confirmedAt = new Date().toISOString();
      user.totalCredit += topup.amount;
      user.availableCredit += topup.amount;
      state.creditHistory.unshift({
        id: `ch_${Date.now()}`,
        userId: user.id,
        type: 'TOPUP',
        amount: topup.amount,
        balance: user.availableCredit,
        ref: topup.id,
        note: 'Nạp Credit qua QR',
        createdAt: new Date().toISOString(),
      });
      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
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
      action: PayloadAction<{ adminId: string; userId: string; amount: number; note: string }>,
    ) {
      const user = state.users.find((entry) => entry.id === action.payload.userId);
      if (!user) return;
      user.totalCredit += action.payload.amount;
      user.availableCredit += action.payload.amount;
      state.creditHistory.unshift({
        id: `ch_${Date.now()}`,
        userId: user.id,
        type: 'ADMIN_ADJUSTMENT',
        amount: action.payload.amount,
        balance: user.availableCredit,
        note: action.payload.note,
        createdAt: new Date().toISOString(),
      });
      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
        adminId: action.payload.adminId,
        action: 'adjust_credit',
        targetType: 'user',
        targetId: user.id,
        detail: action.payload.note,
        createdAt: new Date().toISOString(),
      });
    },
    updateFeeSetting(state, action: PayloadAction<{ adminId: string; fee: number }>) {
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
      if (!user || user.role === 'admin') return;
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
    resetDemoData() {
      return resetPersistedState();
    },
  },
});

export const actions = dataSlice.actions;
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
