import type { AppStateData, ReputationPointRuleKey, RankRule } from '../types/domain';

export function rankFor(points: number, ranks: RankRule[]) {
  return (
    [...ranks]
      .filter((rank) => rank.status !== 'inactive')
      .sort((a, b) => b.minPoints - a.minPoints)
      .find((rank) => points >= rank.minPoints && (rank.maxPoints === undefined || points <= rank.maxPoints))
      ?.name ?? 'Thành viên mới'
  );
}

export function recalculateUserRank(data: AppStateData, userId: string) {
  const user = data.users.find((entry) => entry.id === userId);
  if (user && user.role !== 'admin') user.rank = rankFor(user.rewardPoints, data.ranks);
}

export function applyReputationPointEvent(
  data: AppStateData,
  input: {
    userId: string;
    key: ReputationPointRuleKey;
    ref: string;
    createdAt?: string;
  },
) {
  const user = data.users.find((entry) => entry.id === input.userId && entry.role !== 'admin');
  const rule = data.pointRules.find((entry) => entry.key === input.key && entry.status === 'active');
  if (!user || !rule || data.pointHistory.some((entry) => entry.ref === input.ref && entry.userId === user.id))
    return false;

  const change = rule.type === 'plus' ? rule.points : -rule.points;
  user.rewardPoints = Math.max(0, user.rewardPoints + change);
  recalculateUserRank(data, user.id);
  data.pointHistory.unshift({
    id: `ph_${Date.now()}_${data.pointHistory.length + 1}`,
    userId: user.id,
    ruleId: rule.id,
    event: rule.behavior,
    change,
    pointsAfter: user.rewardPoints,
    ref: input.ref,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
  return true;
}
