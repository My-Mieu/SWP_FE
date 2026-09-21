import { initialData, seedItems } from '../mocks/database';
import type { AppStateData } from '../types/domain';

const KEY = 'shareloop:v1:state';

export function loadPersistedState(): AppStateData {
  if (typeof localStorage === 'undefined') return initialData;
  const raw = localStorage.getItem(KEY);
  if (!raw) return initialData;
  try {
    const parsed = JSON.parse(raw) as AppStateData;
    parsed.topups = (parsed.topups ?? []).map((topup) => ({
      ...topup,
      code: topup.code ?? `SLTOPUP-${topup.id.slice(-6).toUpperCase()}`,
      status: (topup.status as string) === 'success' ? 'completed' : topup.status,
    }));
    const persistedItemIds = new Set((parsed.items ?? []).map((item) => item.id));
    parsed.items = [
      ...(parsed.items ?? []),
      ...seedItems.filter((item) => !persistedItemIds.has(item.id)),
    ];
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
