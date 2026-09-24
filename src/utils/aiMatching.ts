import type { Item, ItemType, User } from '../types/domain';

export interface ParsedNeed {
  category: string;
  district: string;
  type: ItemType | '';
}

export interface SwapSuggestion {
  item: Item;
  owner?: User;
  reason: string;
}

const STOP_WORDS = new Set([
  'ban',
  'can',
  'cho',
  'dang',
  'do',
  'doi',
  'duoc',
  'hang',
  'mien',
  'mon',
  'phi',
  'tim',
  'trao',
  'tang',
  'toi',
  'trong',
  'voi',
]);

const CATEGORY_HINTS: Record<string, string[]> = {
  'do dien tu': ['dien tu', 'tai nghe', 'loa', 'may anh', 'ban phim', 'chuot', 'laptop'],
  'noi that': ['sofa', 'ghe', 'ban', 'ke sach', 'noi that'],
  sach: ['sach', 'tieu thuyet', 'van hoc'],
  'thoi trang': ['ao', 'giay', 'sneaker', 'thoi trang'],
  'do gia dung': ['noi com', 'noi inox', 'may xay', 'hop thuy tinh', 'gia dung'],
  'phu kien': ['phu kien', 'balo', 'tui', 'vi', 'dong ho'],
  'nuoc hoa': ['nuoc hoa', 'huong', 'nen thom'],
  'do hoc tap': ['hoc tap', 'den ban', 'gia ve'],
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const tokensOf = (value: string) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const textOf = (item: Item) =>
  `${item.title} ${item.description} ${item.category} ${item.district} ${item.tradeFor ?? ''}`;

const overlapScore = (needles: string[], haystack: string) => {
  const normalized = normalize(haystack);
  return needles.reduce((score, token) => score + (normalized.includes(token) ? 1 : 0), 0);
};

export function parseNeed(text: string, categories: readonly string[], districts: readonly string[]): ParsedNeed {
  const normalized = normalize(text);
  const district = districts.find((entry) => normalized.includes(normalize(entry))) ?? '';
  const directCategory = categories.find((entry) => normalized.includes(normalize(entry)));
  const hintedCategory =
    directCategory ??
    categories.find((entry) =>
      (CATEGORY_HINTS[normalize(entry)] ?? []).some((hint) => normalized.includes(hint)),
    ) ??
    '';
  const type = normalized.includes('mien phi') || normalized.includes('cho tang')
    ? 'gift'
    : normalized.includes('trao doi') || normalized.includes(' doi ')
      ? 'trade'
      : '';

  return {
    category: hintedCategory,
    district,
    type,
  };
}

export function findNeedMatches(
  items: Item[],
  text: string,
  filters: ParsedNeed,
) {
  const parsed = filters;
  const tokens = tokensOf(text);

  return items
    .filter((item) => item.status === 'approved' || item.status === 'APPROVED')
    .filter((item) => !parsed.district || item.district === parsed.district)
    .filter((item) => !parsed.type || item.type === parsed.type)
    .filter((item) => !parsed.category || item.category === parsed.category)
    .map((item) => ({ item, score: overlapScore(tokens, textOf(item)) }))
    .filter(({ score }) => score > 0 || Boolean(parsed.category || parsed.district || parsed.type))
    .sort((a, b) => b.score - a.score || b.item.postedAt.localeCompare(a.item.postedAt))
    .map(({ item }) => item)
    .slice(0, 5);
}

export function getSwapSuggestions(
  sourceItem: Item,
  items: Item[],
  users: User[],
  currentUserId: string,
): SwapSuggestion[] {
  const sourceTokens = tokensOf(`${sourceItem.title} ${sourceItem.category} ${sourceItem.tradeFor ?? ''}`);

  return items
    .filter((item) => item.type === 'trade')
    .filter((item) => item.status === 'approved' || item.status === 'APPROVED')
    .filter((item) => item.id !== sourceItem.id)
    .filter((item) => item.ownerId !== currentUserId)
    .map((item) => {
      const wantsSource = overlapScore(sourceTokens, `${item.tradeFor ?? ''} ${item.description}`);
      const sourceWantsTarget = overlapScore(tokensOf(item.title), sourceItem.tradeFor ?? '');
      const sameCategory = item.category === sourceItem.category ? 2 : 0;
      const sameDistrict = item.district === sourceItem.district ? 1 : 0;
      const score = wantsSource + sourceWantsTarget + sameCategory + sameDistrict;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || b.item.postedAt.localeCompare(a.item.postedAt))
    .slice(0, 5)
    .map(({ item }) => {
      const owner = users.find((user) => user.id === item.ownerId);
      const reason =
        item.category === sourceItem.category
          ? `Phù hợp vì cả hai món cùng nhóm ${item.category.toLowerCase()} và người đăng có nhu cầu trao đổi rõ ràng.`
          : item.tradeFor
            ? `Phù hợp vì người đăng đang tìm ${item.tradeFor.toLowerCase()}, gần với món bạn đã đăng.`
            : 'Phù hợp vì đây là món trao đổi đã được duyệt và còn đang hoạt động trên SHARELOOP.';
      return { item, owner, reason };
    });
}
