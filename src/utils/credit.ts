import type { AppStateData, CreditHistory, Transaction } from '../types/domain';
import { canTransition, transitionTransaction } from './transaction';

export function txFee(data: AppStateData) {
  const setting = data.settings.find((s) => s.key === 'tx_fee_credit');
  return Number(setting?.value ?? 5);
}

export function calculateTransactionFee(
  transaction: Transaction,
  userId: string,
  data: AppStateData,
) {
  const fee = transaction.feeCredit ?? txFee(data);
  if (transaction.type === 'trade') return fee;
  return transaction.requesterId === userId ? fee : 0;
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
}

function hasHistory(data: AppStateData, ref: string) {
  return data.creditHistory.some((entry) => entry.ref === ref);
}

function payerIds(tx: Transaction) {
  return tx.type === 'trade' ? [tx.ownerId, tx.requesterId] : [tx.requesterId];
}

function validFee(fee: number) {
  return Number.isSafeInteger(fee) && fee >= 0;
}

function history(
  id: string,
  userId: string,
  amount: number,
  balance: number,
  ref: string,
  note: string,
): CreditHistory {
  return {
    id,
    userId,
    type: amount < 0 ? 'HOLD' : 'RELEASE_HOLD',
    amount,
    balance,
    ref,
    note,
    createdAt: new Date().toISOString(),
  };
}

export function holdFee(data: AppStateData, transactionId: string, userId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  const user = data.users.find((item) => item.id === userId);
  if (!tx || !user || !payerIds(tx).includes(userId)) return false;
  const fee = calculateTransactionFee(tx, userId, data);
  const ref = `${transactionId}:${userId}:HOLD`;
  const next = tx.status === 'SCHEDULE_CONFIRMED' ? 'CREDIT_HELD' : 'WAITING_HANDOVER';
  if (
    !validFee(fee) ||
    fee === 0 ||
    tx.creditHeldBy.includes(userId) ||
    hasHistory(data, ref) ||
    !canTransition(tx, next) ||
    user.availableCredit < fee
  )
    return false;
  user.availableCredit -= fee;
  user.holdCredit += fee;
  tx.creditHeldBy.push(userId);
  transitionTransaction(tx, next);
  if (payerIds(tx).every((payerId) => tx.creditHeldBy.includes(payerId)))
    transitionTransaction(tx, 'WAITING_HANDOVER');
  data.creditHistory.push(
    history(
      `ch_${ref}`,
      userId,
      -fee,
      user.availableCredit,
      ref,
      `Giữ phí giao dịch ${transactionId}`,
    ),
  );
  return true;
}

export function releaseFee(data: AppStateData, transactionId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  if (!tx || !canTransition(tx, 'CANCELLED')) return false;
  const releases = tx.creditHeldBy.map((userId) => {
    const user = data.users.find((item) => item.id === userId);
    const fee = calculateTransactionFee(tx, userId, data);
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
    data.creditHistory.push(
      history(
        `ch_${ref}`,
        userId,
        fee,
        user.availableCredit,
        ref,
        `Hoàn giữ phí giao dịch ${transactionId}`,
      ),
    );
  });
  tx.creditHeldBy = [];
  transitionTransaction(tx, 'CANCELLED');
  tx.cancelledAt = new Date().toISOString();
  return true;
}

export function spendHeldFee(data: AppStateData, transactionId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  if (!tx || !canTransition(tx, 'COMPLETED') || !tx.senderConfirmed || !tx.receiverConfirmed)
    return false;
  const payers = payerIds(tx);
  if (!payers.every((id) => tx.creditHeldBy.includes(id))) return false;
  const spends = payers.map((userId) => ({
    userId,
    user: data.users.find((item) => item.id === userId),
    fee: calculateTransactionFee(tx, userId, data),
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
  spends.forEach(({ userId, user, fee, ref }) => {
    if (!user) return;
    user.totalCredit -= fee;
    user.holdCredit -= fee;
    data.creditHistory.push({
      id: `ch_${ref}`,
      userId,
      type: 'TRANSACTION_FEE',
      amount: -fee,
      balance: user.availableCredit,
      ref,
      note: `Phí giao dịch hoàn tất ${transactionId}`,
      createdAt: new Date().toISOString(),
    });
  });
  tx.creditHeldBy = [];
  transitionTransaction(tx, 'COMPLETED');
  tx.completedAt = new Date().toISOString();
  return true;
}
