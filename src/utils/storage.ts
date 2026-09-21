import {
  initialData,
  seedComplaints,
  seedCreditHistory,
  seedDistricts,
  seedItems,
  seedKeywords,
  seedRanks,
} from '../mocks/database';
import type { AppStateData } from '../types/domain';

const KEY = 'shareloop:v1:state';

function rankFor(points: number, ranks = seedRanks) {
  return (
    [...ranks]
      .sort((a, b) => b.minPoints - a.minPoints)
      .find((rank) => points >= rank.minPoints && (rank.maxPoints === undefined || points <= rank.maxPoints))
      ?.name ?? 'Thành viên mới'
  );
}

function normalizeCreditHistory(parsed: AppStateData) {
  const existing = (parsed.creditHistory ?? []).map((entry) => {
    const entryType = entry.type as string;
    const relatedTransactionId =
      entry.relatedTransactionId ?? entry.ref?.split(':')[0] ?? entry.transactionId?.split(':')[0];
    const type =
      entryType === 'TRANSACTION_FEE'
        ? 'SPEND'
        : entryType === 'AI_FEE'
          ? 'AI_SPEND'
          : entryType === 'RELEASE_HOLD'
          ? 'REFUND'
          : entry.type;
    const transactionId = entry.transactionId ?? entry.ref ?? entry.id;
    const description = entry.description ?? entry.note;
    const status =
      entry.status ??
      (type === 'HOLD'
        ? 'holding'
        : type === 'REFUND'
          ? 'refunded'
          : 'completed');
    return {
      ...entry,
      transactionId,
      type,
      description,
      status,
      relatedTransactionId,
      note: entry.note ?? description,
    };
  });
  const existingIds = new Set(existing.map((entry) => entry.id));
  return [...existing, ...seedCreditHistory.filter((entry) => !existingIds.has(entry.id))];
}

export function loadPersistedState(): AppStateData {
  if (typeof localStorage === 'undefined') return initialData;
  const raw = localStorage.getItem(KEY);
  if (!raw) return initialData;
  try {
    const parsed = JSON.parse(raw) as AppStateData;
    if (parsed.settings?.some((setting) => setting.key === 'tx_fee_credit' && Number(setting.value) <= 5)) {
      localStorage.setItem(KEY, JSON.stringify(initialData));
      return initialData;
    }
    parsed.topups = (parsed.topups ?? []).map((topup) => ({
      ...topup,
      code: topup.code ?? `SLTOPUP-${topup.id.slice(-6).toUpperCase()}`,
      status: (topup.status as string) === 'success' ? 'completed' : topup.status,
    }));
    parsed.transactions = (parsed.transactions ?? []).map((tx) => ({
      ...tx,
      creditHeld: tx.creditHeld ?? tx.creditHeldBy.length > 0,
      feeCaptured: tx.feeCaptured ?? false,
      ownerScheduleConfirmed: tx.ownerScheduleConfirmed ?? false,
      requesterScheduleConfirmed: tx.requesterScheduleConfirmed ?? false,
      completedByOwner: tx.completedByOwner ?? tx.senderConfirmed ?? false,
      completedByRequester: tx.completedByRequester ?? tx.receiverConfirmed ?? false,
      status:
        tx.status === 'CREDIT_HELD' &&
        (tx.type === 'gift'
          ? tx.creditHeldBy.includes(tx.requesterId)
          : tx.creditHeldBy.includes(tx.ownerId) && tx.creditHeldBy.includes(tx.requesterId))
          ? 'WAITING_HANDOVER'
          : tx.status,
    }));
    const persistedItemIds = new Set((parsed.items ?? []).map((item) => item.id));
    parsed.items = [
      ...(parsed.items ?? []),
      ...seedItems.filter((item) => !persistedItemIds.has(item.id)),
    ];
    parsed.keywords = parsed.keywords ?? seedKeywords;
    parsed.districts = parsed.districts ?? seedDistricts;
    parsed.complaints = parsed.complaints ?? seedComplaints;
    parsed.systemRevenue = parsed.systemRevenue ?? 0;
    parsed.aiUsage = parsed.aiUsage ?? [];
    parsed.ranks = parsed.ranks ?? seedRanks;
    parsed.creditHistory = normalizeCreditHistory(parsed);
    parsed.users = (parsed.users ?? []).map((user) =>
      user.role === 'admin' ? user : { ...user, rank: rankFor(user.rewardPoints, parsed.ranks) },
    );
    return parsed;
  } catch {
    return initialData;
  }
}

export function savePersistedState(state: AppStateData) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetPersistedState(): AppStateData {
  localStorage.setItem(KEY, JSON.stringify(initialData));
  return initialData;
}
