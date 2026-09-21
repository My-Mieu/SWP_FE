import type { Transaction, TransactionStatus } from '../types/domain';

const allowed: Record<TransactionStatus, TransactionStatus[]> = {
  NEGOTIATING: ['SCHEDULE_PROPOSED', 'CANCELLED'],
  SCHEDULE_PROPOSED: ['SCHEDULE_CONFIRMED', 'SCHEDULE_PROPOSED', 'CANCELLED'],
  SCHEDULE_CONFIRMED: ['CREDIT_HELD', 'CANCELLED'],
  CREDIT_HELD: ['WAITING_HANDOVER', 'DISPUTED', 'CANCELLED'],
  WAITING_HANDOVER: ['SENDER_CONFIRMED', 'RECEIVER_CONFIRMED', 'DISPUTED', 'CANCELLED'],
  SENDER_CONFIRMED: ['COMPLETED', 'DISPUTED', 'CANCELLED'],
  RECEIVER_CONFIRMED: ['COMPLETED', 'DISPUTED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: [],
};

export function canTransition(tx: Transaction, next: TransactionStatus) {
  return allowed[tx.status].includes(next);
}

export function transitionTransaction(tx: Transaction, next: TransactionStatus) {
  if (!canTransition(tx, next)) return false;
  tx.status = next;
  return true;
}

export function progressIndex(status: TransactionStatus) {
  const steps: Partial<Record<TransactionStatus, number>> = {
    NEGOTIATING: 0,
    SCHEDULE_PROPOSED: 1,
    SCHEDULE_CONFIRMED: 2,
    CREDIT_HELD: 3,
    WAITING_HANDOVER: 4,
    SENDER_CONFIRMED: 4,
    RECEIVER_CONFIRMED: 4,
    COMPLETED: 4,
    CANCELLED: 2,
    DISPUTED: 4,
  };
  return steps[status] ?? 0;
}
