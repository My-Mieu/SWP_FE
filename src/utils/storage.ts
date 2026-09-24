import {
  initialData,
  seedComplaints,
  seedCreditHistory,
  seedDistricts,
  seedItems,
  seedKeywords,
  seedPointHistory,
  seedPointRules,
  seedRanks,
} from '../mocks/database';
import type { AppStateData } from '../types/domain';
import { rankFor } from './reputation';

const KEY = 'shareloop:v1:state';

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

function scaleCreditsDown(parsed: AppStateData) {
  parsed.systemRevenue = Math.round((parsed.systemRevenue ?? 0) / 10);
  parsed.users = (parsed.users ?? []).map((user) => ({
    ...user,
    totalCredit: Math.round(user.totalCredit / 10),
    availableCredit: Math.round(user.availableCredit / 10),
    holdCredit: Math.round(user.holdCredit / 10),
  }));
  parsed.creditHistory = (parsed.creditHistory ?? []).map((entry) => ({
    ...entry,
    amount: Math.round(entry.amount / 10),
    balance: Math.round(entry.balance / 10),
  }));
  parsed.topups = (parsed.topups ?? []).map((topup) => ({
    ...topup,
    amount: Math.round(topup.amount / 10),
    vnd: Math.round(topup.vnd / 10),
  }));
  parsed.transactions = (parsed.transactions ?? []).map((tx) => ({
    ...tx,
    feeCredit: tx.feeCredit === undefined ? undefined : Math.round(tx.feeCredit / 10),
  }));
  parsed.settings = (parsed.settings ?? []).map((setting) =>
    setting.key === 'tx_fee_credit' && typeof setting.value === 'number'
      ? { ...setting, value: Math.round(setting.value / 10) }
      : setting,
  );
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
    const scaleVersion = Number(parsed.settings?.find((setting) => setting.key === 'credit_scale_version')?.value ?? 1);
    if (scaleVersion < 2) {
      scaleCreditsDown(parsed);
      parsed.settings = [
        ...(parsed.settings ?? []).filter((setting) => setting.key !== 'credit_scale_version'),
        {
          key: 'credit_scale_version',
          value: 2,
          label: 'Phiên bản quy đổi Credit',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
        },
      ];
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
    parsed.pointRules = parsed.pointRules ?? seedPointRules;
    parsed.pointHistory = parsed.pointHistory ?? seedPointHistory;
    parsed.creditHistory = normalizeCreditHistory(parsed);
    const demoHistory = parsed.creditHistory.filter((entry) => entry.userId === 'user_001');
    if (demoHistory.some((entry) => entry.amount === 5000 || entry.amount === -200 || entry.type === 'HOLD')) {
      parsed.creditHistory = [
        ...seedCreditHistory.filter((entry) => entry.userId === 'user_001'),
        ...parsed.creditHistory.filter((entry) => entry.userId !== 'user_001'),
      ];
      parsed.topups = (parsed.topups ?? []).filter((topup) => topup.userId !== 'user_001');
    }
    parsed.users = (parsed.users ?? []).map((user) => {
      // Older demo data used the typo "use" for the seeded demo user.
      const normalizedUser = user.id === 'user_001' && user.username === 'use'
        ? { ...user, username: 'user' }
        : user;
      const demoWalletUser = normalizedUser.id === 'user_001' &&
        normalizedUser.totalCredit >= 11996 &&
        normalizedUser.availableCredit >= 11796 &&
        normalizedUser.holdCredit === 200
        ? { ...normalizedUser, totalCredit: 20, availableCredit: 20, holdCredit: 0 }
        : normalizedUser;
      return demoWalletUser.role === 'admin'
        ? demoWalletUser
        : { ...demoWalletUser, rank: rankFor(demoWalletUser.rewardPoints, parsed.ranks) };
    });
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
