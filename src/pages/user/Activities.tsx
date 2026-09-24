import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Alert,
  Button,
  ConditionBadge,
  EmptyState,
  Field,
  Icon,
  PageHeader,
  StatusBadge,
  TextArea,
  TypeBadge,
} from '../../components/ui';
import { getSwapSuggestions } from '../../utils/aiMatching';
import { conditionLabel } from '../../utils/formatting';
import { AI_SWAP_MATCHING_FEE } from '../../utils/credit';

export function Activities() {
  const data = useAppSelector(selectData);
  const user = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'items' | 'transactions'>('items');
  const [editingId, setEditingId] = useState('');
  const [suggestionSourceId, setSuggestionSourceId] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [creditError, setCreditError] = useState('');
  const myItems = data.items.filter((i) => i.ownerId === user.id);
  const suggestionSource = myItems.find((item) => item.id === suggestionSourceId);
  const swapSuggestions = useMemo(
    () =>
      suggestionSource
        ? getSwapSuggestions(suggestionSource, data.items, data.users, user.id)
        : [],
    [data.items, data.users, suggestionSource, user.id],
  );
  const txs = data.transactions.filter((t) => t.ownerId === user.id || t.requesterId === user.id);
  const sendSwapRequest = (sourceItemId: string, targetItemId: string) => {
    if (user.reputationStars <= 0) {
      setCreditError('Uy tín của bạn đang ở mức 0 nên hiện không thể gửi yêu cầu trao đổi.');
      return;
    }
    const target = data.items.find((item) => item.id === targetItemId);
    const owner = target ? data.users.find((entry) => entry.id === target.ownerId) : undefined;
    if (user.availableCredit < 2 || !owner || owner.availableCredit < 2) {
      setCreditError('Bạn không đủ Credit để thực hiện thao tác này.');
      return;
    }
    setCreditError('');
    dispatch(actions.createTransaction({ itemId: targetItemId, requesterId: user.id, sourceItemId }));
    navigate('/messages');
  };
  return (
    <div className="page-shell">
      <PageHeader
        title="Hoạt động"
        description="Quản lý bài đăng, yêu cầu và tiến trình giao dịch của bạn."
        action={
          <Link to="/post">
            <Button icon="add">Đăng món mới</Button>
          </Link>
        }
      />
      {creditError ? (
        <Alert tone="error">
          <p>{creditError}</p>
          <Button className="mt-2" size="sm" variant="outline" onClick={() => navigate('/credit')}>
            Nạp Credit
          </Button>
        </Alert>
      ) : null}
      <div className="mb-6 flex gap-1 border-b border-border">
        <button
          onClick={() => setTab('items')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === 'items' ? 'border-primary text-primary' : 'border-transparent text-text-muted'}`}
        >
          Món đã đăng <span className="ml-1 text-xs">({myItems.length})</span>
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-text-muted'}`}
        >
          Giao dịch <span className="ml-1 text-xs">({txs.length})</span>
        </button>
      </div>
      {tab === 'items' ? (
        <section>
          {myItems.length ? (
            <div className="space-y-3">
              {myItems.map((item) => {
                const canUseAiSwap = item.type === 'trade' && (item.status === 'approved' || item.status === 'APPROVED');
                const isSuggestionOpen = suggestionSourceId === item.id;

                return (
                  <div key={item.id} className="space-y-3">
                    <article className="grid gap-4 rounded-lg bg-white p-3 ring-1 ring-border/80 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="aspect-[4/3] w-full rounded-md object-cover sm:w-[120px]"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <TypeBadge type={item.type} />
                          <StatusBadge status={item.status} />
                        </div>
                        <Link
                          to={`/items/${item.id}`}
                          className="mt-2 block truncate font-bold hover:text-primary"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-1 text-xs text-text-muted">
                          Hết hạn {new Date(item.expiresAt).toLocaleDateString('vi-VN')} ·{' '}
                          {item.district}
                        </p>
                        {(item.status === 'rejected' || item.status === 'REJECTED' || item.status === 'VIOLATION') && (item.rejectionReason || item.moderationReason) ? (
                          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs leading-5 text-error">
                            Lý do kiểm duyệt: {item.rejectionReason ?? item.moderationReason}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-1 sm:justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="edit"
                          onClick={() => {
                            setEditingId(item.id);
                            setDraftTitle(item.title);
                            setDraftDescription(item.description);
                          }}
                        >
                          Sửa
                        </Button>
                        {canUseAiSwap ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="ai"
                            onClick={() => {
                              if (!isSuggestionOpen && user.availableCredit < AI_SWAP_MATCHING_FEE) {
                                setCreditError('Bạn không đủ Credit để thực hiện thao tác này.');
                                return;
                              }
                              setCreditError('');
                              if (!isSuggestionOpen)
                                dispatch(
                                  actions.useAiFeature({
                                    userId: user.id,
                                    feature: 'SWAP_MATCHING',
                                  }),
                                );
                              setSuggestionSourceId(isSuggestionOpen ? '' : item.id);
                            }}
                          >
                            AI gợi ý đổi
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="danger"
                          icon="trash"
                          onClick={() =>
                            dispatch(actions.removeItem({ itemId: item.id, ownerId: user.id }))
                          }
                        >
                          Gỡ
                        </Button>
                      </div>
                    </article>
                    {isSuggestionOpen ? (
                      <div className="rounded-lg bg-white p-4 ring-1 ring-primary/15 sm:p-5">
                        <div className="flex items-center gap-2">
                          <span className="flex size-9 items-center justify-center rounded-md bg-primary-faint text-primary">
                            <Icon name="ai" className="size-5" weight="fill" />
                          </span>
                          <div>
                            <h2 className="text-sm font-bold text-text-primary">
                              Gợi ý phù hợp với {item.title}
                            </h2>
                            <p className="mt-0.5 text-xs text-text-muted">
                              Chỉ lấy món trao đổi đã duyệt từ dữ liệu SHARELOOP.
                            </p>
                          </div>
                        </div>
                        {swapSuggestions.length ? (
                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            {swapSuggestions.map((suggestion) => (
                              <article
                                key={suggestion.item.id}
                                className="grid gap-3 rounded-lg bg-background p-3 ring-1 ring-border/70 sm:grid-cols-[96px_1fr]"
                              >
                                <img
                                  src={suggestion.item.images[0]}
                                  alt={suggestion.item.title}
                                  className="aspect-[4/3] w-full rounded-md object-cover sm:w-24"
                                />
                                <div className="min-w-0">
                                  <Link
                                    to={`/items/${suggestion.item.id}`}
                                    className="line-clamp-1 font-bold hover:text-primary"
                                  >
                                    {suggestion.item.title}
                                  </Link>
                                  <p className="mt-1 text-xs text-text-muted">
                                    {suggestion.owner?.name ?? 'Người dùng SHARELOOP'} ·{' '}
                                    {suggestion.item.district}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <ConditionBadge condition={suggestion.item.condition} />
                                    <span className="inline-flex rounded-sm bg-surface-low px-2 py-1 text-[11px] font-medium text-text-secondary">
                                      {suggestion.item.tradeFor
                                        ? `Muốn đổi: ${suggestion.item.tradeFor}`
                                        : conditionLabel[suggestion.item.condition]}
                                    </span>
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">
                                    {suggestion.reason}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <Link to={`/items/${suggestion.item.id}`}>
                                      <Button size="sm" variant="outline">
                                        Xem món
                                      </Button>
                                    </Link>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      icon="send"
                                      onClick={() => sendSwapRequest(item.id, suggestion.item.id)}
                                    >
                                      Gửi đề nghị trao đổi
                                    </Button>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4">
                            <EmptyState
                              icon="ai"
                              title="Chưa có gợi ý phù hợp"
                              text="Hiện chưa có món trao đổi đã duyệt khác trong dữ liệu SHARELOOP."
                            />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Bạn chưa đăng món nào"
              text="Đăng món đầu tiên để bắt đầu chia sẻ với cộng đồng."
              action={
                <Link to="/post">
                  <Button>Đăng món đồ</Button>
                </Link>
              }
            />
          )}
        </section>
      ) : (
        <section>
          {txs.length ? (
            <div className="space-y-3">
              {txs.map((tx) => {
                const item = data.items.find((i) => i.id === tx.itemId)!;
                const other = data.users.find(
                  (u) => u.id === (tx.ownerId === user.id ? tx.requesterId : tx.ownerId),
                );
                return (
                  <article
                    key={tx.id}
                    className="rounded-lg bg-white p-4 ring-1 ring-border/80 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={item.images[0]}
                          alt=""
                          className="size-14 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <Link
                            to="/messages"
                            className="block truncate font-bold hover:text-primary"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 text-xs text-text-muted">
                            Với {other?.name} · {tx.id}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={tx.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                      <p className="text-xs text-text-muted">
                        {tx.creditHeldBy.includes(user.id)
                          ? 'Phí của bạn đang được giữ an toàn.'
                          : 'Chưa xác nhận giữ phí.'}
                      </p>
                      <Link to="/messages">
                        <Button size="sm" variant="outline" icon="messages">
                          Mở giao dịch
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Chưa có giao dịch"
              text="Các yêu cầu nhận đồ và trao đổi sẽ xuất hiện tại đây."
            />
          )}
        </section>
      )}
      {editingId ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/30 sm:place-items-center sm:p-4">
          <div className="w-full rounded-t-xl bg-white p-5 shadow-lg sm:max-w-lg sm:rounded-xl sm:p-6">
            <h2 className="text-xl font-bold">Chỉnh sửa bài đăng</h2>
            <p className="mt-1 text-sm text-text-muted">Bài sẽ chờ duyệt lại sau khi lưu.</p>
            <div className="mt-5 space-y-4">
              <Field
                label="Tên món đồ"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
              />
              <TextArea
                label="Mô tả"
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingId('')}>
                Hủy
              </Button>
              <Button
                onClick={() => {
                  const item = data.items.find((entry) => entry.id === editingId);
                  if (!item) return;
                  dispatch(
                    actions.updateItem({
                      itemId: item.id,
                      ownerId: user.id,
                      changes: {
                        title: draftTitle,
                        description: draftDescription,
                        category: item.category,
                        condition: item.condition,
                        district: item.district,
                        tradeFor: item.tradeFor,
                      },
                    }),
                  );
                  setEditingId('');
                }}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
