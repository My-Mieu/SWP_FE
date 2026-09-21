import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Button,
  EmptyState,
  Field,
  PageHeader,
  StatusBadge,
  TextArea,
  TypeBadge,
} from '../../components/ui';
export function Activities() {
  const data = useAppSelector(selectData);
  const user = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'items' | 'transactions'>('items');
  const [editingId, setEditingId] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const myItems = data.items.filter((i) => i.ownerId === user.id);
  const txs = data.transactions.filter((t) => t.ownerId === user.id || t.requesterId === user.id);
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
              {myItems.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-lg bg-white p-3 ring-1 ring-border/80 sm:grid-cols-[120px_1fr_auto] sm:items-center"
                >
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
                      to={`/product/${item.id}`}
                      className="mt-2 block truncate font-bold hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-text-muted">
                      Hết hạn {new Date(item.expiresAt).toLocaleDateString('vi-VN')} ·{' '}
                      {item.district}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:justify-end">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="renew"
                      onClick={() =>
                        dispatch(actions.renewItem({ itemId: item.id, ownerId: user.id }))
                      }
                    >
                      Gia hạn
                    </Button>
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
              ))}
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
