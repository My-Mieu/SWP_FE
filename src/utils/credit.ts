import type { AppStateData, CreditHistory, Transaction } from '../types/domain';

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
    if (user.totalCredit !== user.availableCredit + user.holdCredit) {
      throw new Error(`Credit invariant failed for ${user.id}`);
    }
  });
}

function hasHistory(data: AppStateData, ref: string) {
  return data.creditHistory.some((entry) => entry.ref === ref);
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
  if (!tx || !user) return;
  const fee = calculateTransactionFee(tx, userId, data);
  const ref = `${transactionId}:${userId}:HOLD`;
  if (fee <= 0 || tx.creditHeldBy.includes(userId) || hasHistory(data, ref)) return;
  if (user.availableCredit < fee) throw new Error('Không đủ Credit khả dụng');
  user.availableCredit -= fee;
  user.holdCredit += fee;
  tx.creditHeldBy.push(userId);
  tx.status = 'CREDIT_HELD';
  const requiredPayers = tx.type === 'trade' ? [tx.ownerId, tx.requesterId] : [tx.requesterId];
  if (requiredPayers.every((payerId) => tx.creditHeldBy.includes(payerId))) {
    tx.status = 'WAITING_HANDOVER';
  }
  data.creditHistory.push(
    history(
      `ch_${Date.now()}_${userId}`,
      userId,
      -fee,
      user.availableCredit,
      ref,
      `Giữ phí giao dịch ${transactionId}`,
    ),
  );
}

export function releaseFee(data: AppStateData, transactionId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  if (!tx) return;
  tx.creditHeldBy.forEach((userId) => {
    const user = data.users.find((item) => item.id === userId);
    if (!user) return;
    const fee = calculateTransactionFee(tx, userId, data);
    const ref = `${transactionId}:${userId}:RELEASE`;
    if (hasHistory(data, ref)) return;
    user.availableCredit += fee;
    user.holdCredit -= fee;
    data.creditHistory.push(
      history(
        `ch_${Date.now()}_${userId}`,
        userId,
        fee,
        user.availableCredit,
        ref,
        `Hoàn giữ phí giao dịch ${transactionId}`,
      ),
    );
  });
  tx.creditHeldBy = [];
  tx.status = 'CANCELLED';
  tx.cancelledAt = new Date().toISOString();
}

export function spendHeldFee(data: AppStateData, transactionId: string) {
  const tx = data.transactions.find((item) => item.id === transactionId);
  if (!tx || tx.status === 'COMPLETED') return;
  tx.creditHeldBy.forEach((userId) => {
    const user = data.users.find((item) => item.id === userId);
    if (!user) return;
    const fee = calculateTransactionFee(tx, userId, data);
    const ref = `${transactionId}:${userId}:SPEND`;
    if (hasHistory(data, ref)) return;
    user.totalCredit -= fee;
    user.holdCredit -= fee;
    data.creditHistory.push({
      id: `ch_${Date.now()}_${userId}`,
      userId,
      type: 'TRANSACTION_FEE',
      amount: -fee,
      balance: user.availableCredit,
      ref,
      note: `Phí giao dịch hoàn tất ${transactionId}`,
      createdAt: new Date().toISOString(),
    });
  });
  tx.status = 'COMPLETED';
  tx.completedAt = new Date().toISOString();
}
