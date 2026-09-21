import type { AppStateData, CreditHistory, Transaction } from '../types/domain';
import { canTransition, transitionTransaction } from './transaction';

export const SWAP_PARTY_FEE = 2000;
export const GIVE_RECEIVER_FEE = 4000;
export const AI_SWAP_MATCHING_FEE = 5000;
export const AI_ASSISTANT_SEARCH_FEE = 1000;
export const TOPUP_MIN_VND = 10000;

export function txFee(data: AppStateData) {
  const setting = data.settings.find((s) => s.key === 'tx_fee_credit');
  const value = Number(setting?.value ?? SWAP_PARTY_FEE);
  return Number.isSafeInteger(value) && value > 0 ? value : SWAP_PARTY_FEE;
}

export function payerIds(tx: Transaction) {
  return tx.type === 'trade' ? [tx.ownerId, tx.requesterId] : [tx.requesterId];
}

export function requiredCreditForItemType(type: Transaction['type']) {
  return type === 'trade' ? SWAP_PARTY_FEE : GIVE_RECEIVER_FEE;
}

export function calculateTransactionFee(transaction: Transaction, userId: string) {
  if (transaction.type === 'trade') {
    return transaction.ownerId === userId || transaction.requesterId === userId
      ? SWAP_PARTY_FEE
      : 0;
  }
  return transaction.requesterId === userId ? GIVE_RECEIVER_FEE : 0;
}

export function feeLabel(fee: number) {
  return `${fee.toLocaleString('vi-VN')} Credit`;
}

export function feeText(transaction: Transaction, userId: string) {
  const fee = calculateTransactionFee(transaction, userId);
  return fee > 0 ? `Phi cua ban: ${feeLabel(fee)}` : 'Ban khong phai tra phi';
}

export function assertWalletInvariant(data: AppStateData) {
  data.users.forEach((user) => {
    if (
      !Number.isSafeInteger(user.totalCredit) ||
      !Number.isSafeInteger(user.availableCredit) ||
      !Number.isSafeInteger(user.holdCredit) ||
      user.totalCredit < 0 ||
      user.availableCredit < 0 ||
      user.holdCredit < 0 ||
      user.totalCredit !== user.availableCredit + user.holdCredit
    ) {
      throw new Error(`Credit invariant failed for ${user.id}`);
    }
  });
  if (!Number.isSafeInteger(data.systemRevenue) || data.systemRevenue < 0) {
    throw new Error('System revenue invariant failed');
  }
}

function hasHistory(data: AppStateData, ref: string) {
  return data.creditHistory.some((entry) => entry.ref === ref);
}

function validFee(fee: number) {
  return Number.isSafeInteger(fee) && fee >= 0;
}

function itemTitle(data: AppStateData, tx: Transaction) {
  return data.items.find((item) => item.id === tx.itemId)?.title ?? tx.id;
}

function ledgerEntry(
  data: AppStateData,
  input: Omit<CreditHistory, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): CreditHistory {
  return {
    ...input,
    id: input.id ?? `ch_${Date.now()}_${data.creditHistory.length + 1}`,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

function addLedger(data: AppStateData, entry: CreditHistory) {
  if (!entry.ref || !hasHistory(data, entry.ref)) data.creditHistory.unshift(entry);
}

export function canPayTransactionFees(data: AppStateData, tx: Transaction) {
  return payerIds(tx).every((userId) => {
    const user = data.users.find((entry) => entry.id === userId);
    const fee = calculateTransactionFee(tx, userId);
    return user && validFee(fee) && user.availableCredit >= fee;
  });
}

export function missingCreditMessages(data: AppStateData, tx: Transaction) {
  return payerIds(tx)
    .map((userId) => {
      const user = data.users.find((entry) => entry.id === userId);
      const fee = calculateTransactionFee(tx, userId);
      if (user && user.availableCredit >= fee) return '';
      return `${user?.name ?? userId} can nap them Credit de tiep tuc giao dich ${tx.id}.`;
    })
    .filter(Boolean);
}

export function holdAllTransactionFees(data: AppStateData, transactionId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  if (!tx || tx.creditHeld || !canTransition(tx, 'CREDIT_HELD')) return false;
  const payers = payerIds(tx);
  const holds = payers.map((userId) => ({
    userId,
    user: data.users.find((item) => item.id === userId),
    fee: calculateTransactionFee(tx, userId),
    ref: `${transactionId}:${userId}:HOLD`,
  }));
  if (
    holds.some(
      ({ user, fee, ref }) =>
        !user || !validFee(fee) || fee <= 0 || user.availableCredit < fee || hasHistory(data, ref),
    )
  ) {
    return false;
  }

  const title = itemTitle(data, tx);
  holds.forEach(({ userId, user, fee, ref }) => {
    if (!user) return;
    user.availableCredit -= fee;
    user.holdCredit += fee;
    tx.creditHeldBy.push(userId);
    addLedger(
      data,
      ledgerEntry(data, {
        userId,
        transactionId: ref,
        type: 'HOLD',
        amount: -fee,
        balance: user.availableCredit,
        description:
          tx.type === 'trade'
            ? `Giu phi giao dich trao doi - ${title}`
            : `Giu phi nhan do - ${title}`,
        status: 'holding',
        relatedTransactionId: transactionId,
        ref,
        note:
          tx.type === 'trade'
            ? `Giu phi giao dich trao doi - ${title}`
            : `Giu phi nhan do - ${title}`,
      }),
    );
  });
  tx.creditHeld = true;
  transitionTransaction(tx, 'CREDIT_HELD');
  transitionTransaction(tx, 'WAITING_HANDOVER');
  return true;
}

export function releaseFee(data: AppStateData, transactionId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  if (!tx || !canTransition(tx, 'CANCELLED') || tx.feeCaptured) return false;
  const releases = tx.creditHeldBy.map((userId) => {
    const user = data.users.find((item) => item.id === userId);
    const fee = calculateTransactionFee(tx, userId);
    return { userId, user, fee, ref: `${transactionId}:${userId}:RELEASE` };
  });
  if (
    releases.some(
      ({ userId, user, fee, ref }) =>
        !user ||
        !payerIds(tx).includes(userId) ||
        !validFee(fee) ||
        user.holdCredit < fee ||
        hasHistory(data, ref) ||
        hasHistory(data, `${transactionId}:${userId}:SPEND`),
    )
  )
    return false;
  releases.forEach(({ userId, user, fee, ref }) => {
    if (!user) return;
    user.availableCredit += fee;
    user.holdCredit -= fee;
    addLedger(
      data,
      ledgerEntry(data, {
        userId,
        transactionId: ref,
        type: 'REFUND',
        amount: fee,
        balance: user.availableCredit,
        description: `Hoan giu phi giao dich ${transactionId}`,
        status: 'refunded',
        relatedTransactionId: transactionId,
        ref,
        note: `Hoan giu phi giao dich ${transactionId}`,
      }),
    );
  });
  tx.creditHeldBy = [];
  tx.creditHeld = false;
  transitionTransaction(tx, 'CANCELLED');
  tx.cancelledAt = new Date().toISOString();
  return true;
}

export function spendHeldFee(data: AppStateData, transactionId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  if (
    !tx ||
    tx.feeCaptured ||
    !canTransition(tx, 'COMPLETED') ||
    !tx.completedByOwner ||
    !tx.completedByRequester
  )
    return false;
  const payers = payerIds(tx);
  if (!tx.creditHeld || !payers.every((id) => tx.creditHeldBy.includes(id))) return false;
  const spends = payers.map((userId) => ({
    userId,
    user: data.users.find((item) => item.id === userId),
    fee: calculateTransactionFee(tx, userId),
    ref: `${transactionId}:${userId}:SPEND`,
  }));
  if (
    spends.some(
      ({ userId, user, fee, ref }) =>
        !user ||
        !validFee(fee) ||
        user.holdCredit < fee ||
        user.totalCredit < fee ||
        !hasHistory(data, `${transactionId}:${userId}:HOLD`) ||
        hasHistory(data, ref) ||
        hasHistory(data, `${transactionId}:${userId}:RELEASE`),
    )
  )
    return false;

  const title = itemTitle(data, tx);
  let capturedTotal = 0;
  spends.forEach(({ userId, user, fee, ref }) => {
    if (!user) return;
    user.totalCredit -= fee;
    user.holdCredit -= fee;
    capturedTotal += fee;
    addLedger(
      data,
      ledgerEntry(data, {
        userId,
        transactionId: ref,
        type: 'SPEND',
        amount: -fee,
        balance: user.availableCredit,
        description:
          tx.type === 'trade'
            ? `Phi giao dich trao doi - ${title}`
            : `Phi nhan do - ${title}`,
        status: 'completed',
        relatedTransactionId: transactionId,
        ref,
        note:
          tx.type === 'trade'
            ? `Phi giao dich trao doi - ${title}`
            : `Phi nhan do - ${title}`,
      }),
    );
  });
  data.systemRevenue += capturedTotal;
  tx.creditHeldBy = [];
  tx.creditHeld = false;
  tx.feeCaptured = true;
  transitionTransaction(tx, 'COMPLETED');
  tx.completedAt = new Date().toISOString();
  const deadline = new Date(tx.completedAt);
  deadline.setDate(deadline.getDate() + 7);
  tx.complaintDeadline = deadline.toISOString();
  return true;
}

export function spendAvailableCredit(
  data: AppStateData,
  input: {
    userId: string;
    amount: number;
    type: 'AI_SPEND' | 'SPEND';
    ref: string;
    description: string;
  },
) {
  const user = data.users.find((entry) => entry.id === input.userId);
  if (
    !user ||
    !Number.isSafeInteger(input.amount) ||
    input.amount <= 0 ||
    user.availableCredit < input.amount ||
    hasHistory(data, input.ref)
  )
    return false;
  user.availableCredit -= input.amount;
  user.totalCredit -= input.amount;
  data.systemRevenue += input.amount;
  addLedger(
    data,
    ledgerEntry(data, {
      userId: user.id,
      transactionId: input.ref,
      type: input.type,
      amount: -input.amount,
      balance: user.availableCredit,
      description: input.description,
      status: 'completed',
      ref: input.ref,
      note: input.description,
    }),
  );
  return true;
}
