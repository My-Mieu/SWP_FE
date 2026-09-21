import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Avatar,
  Button,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Select,
  StatusBadge,
  TextArea,
} from '../../components/ui';
import { DISTRICTS } from '../../constants/domain';
import { calculateTransactionFee } from '../../utils/credit';
import { progressIndex } from '../../utils/transaction';
import type { AppDispatch } from '../../app/store';
import type { Handover, Item, Transaction } from '../../types/domain';
import { fileToDataUrl } from '../../utils/files';

const steps = ['Trao đổi', 'Đề xuất lịch', 'Chốt lịch', 'Giữ phí', 'Bàn giao'];
export function Messages() {
  const data = useAppSelector(selectData);
  const user = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const conversations = data.conversations.filter(
    (c) => c.participantIds.includes(user.id) || user.role === 'admin',
  );
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? '');
  const [mobileChat, setMobileChat] = useState(false);
  const [message, setMessage] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [date, setDate] = useState('2026-09-28');
  const [time, setTime] = useState('18:30');
  const [method, setMethod] = useState<'Gặp trực tiếp' | 'Giao hàng'>('Gặp trực tiếp');
  const [district, setDistrict] = useState(user.district);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const conv = conversations.find((c) => c.id === selectedId);
  const tx = data.transactions.find((t) => t.id === conv?.transactionId);
  const item = data.items.find((i) => i.id === conv?.itemId);
  const other = data.users.find((u) => u.id === conv?.participantIds.find((id) => id !== user.id));
  const messages = useMemo(
    () => data.messages.filter((m) => m.convId === selectedId),
    [data.messages, selectedId],
  );
  const handover = data.handovers.find((h) => h.id === tx?.handoverId);
  const send = () => {
    if (!message.trim() || !conv) return;
    dispatch(actions.sendMessage({ convId: conv.id, sender: user.id, text: message.trim() }));
    setMessage('');
  };
  const select = (id: string) => {
    setSelectedId(id);
    setMobileChat(true);
  };
  const propose = () => {
    if (!tx || !address.trim()) return;
    dispatch(
      actions.proposeHandover({
        transactionId: tx.id,
        date,
        time,
        district,
        address,
        method,
        note,
        proposedBy: user.id,
      }),
    );
    setShowSchedule(false);
  };
  const confirmHandover = () => {
    if (!tx) return;
    dispatch(actions.confirmTransactionSide({ transactionId: tx.id, userId: user.id, evidence }));
    setEvidence([]);
  };
  return (
    <div className="page-shell py-5 sm:py-7">
      <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-border/80 lg:grid lg:h-[calc(100dvh-140px)] lg:min-h-[680px] lg:grid-cols-[330px_1fr]">
        <aside className={`${mobileChat ? 'hidden lg:block' : 'block'} border-r border-border`}>
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <h1 className="text-lg font-bold">Tin nhắn</h1>
            <span className="text-xs text-text-muted">{conversations.length} cuộc trò chuyện</span>
          </div>
          <div className="max-h-[calc(100dvh-210px)] overflow-y-auto">
            {conversations.map((c) => {
              const txItem = data.items.find((i) => i.id === c.itemId);
              const participant = data.users.find(
                (u) => u.id === c.participantIds.find((id) => id !== user.id),
              );
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => select(c.id)}
                  className={`flex w-full gap-3 border-b border-border/70 p-4 text-left transition ${active ? 'bg-primary-faint' : 'hover:bg-background'}`}
                >
                  <Avatar user={participant ?? user} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="truncate text-sm">
                        {participant?.name ?? 'Thành viên'}
                      </strong>
                      <span className="shrink-0 text-[10px] text-text-muted">
                        {new Date(c.lastMessageAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-primary">
                      {txItem?.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-text-muted">{c.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
        {conv && tx && item ? (
          <section
            className={`${mobileChat ? 'grid' : 'hidden lg:grid'} min-h-[680px] grid-rows-[auto_auto_1fr_auto] lg:min-h-0`}
          >
            <header className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-5">
              <IconButton
                icon="arrow"
                label="Quay lại"
                className="rotate-180 lg:hidden"
                onClick={() => setMobileChat(false)}
              />
              {other ? <Avatar user={other} /> : null}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold">{other?.name ?? 'Cuộc trò chuyện'}</h2>
                <p className="truncate text-xs text-text-muted">{item.title}</p>
              </div>
              <StatusBadge status={tx.status} />
            </header>
            <div className="border-b border-border bg-background/70">
              <button
                onClick={() => setShowContext(!showContext)}
                className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.images[0]}
                    alt=""
                    className="size-11 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">Thông tin giao dịch</strong>
                    <span className="text-xs text-text-muted">
                      {calculateTransactionFee(tx, user.id, data)} Credit phí của bạn
                    </span>
                  </span>
                </span>
                <Icon
                  name="chevronDown"
                  className={`size-4 transition ${showContext ? 'rotate-180' : ''}`}
                />
              </button>
              {showContext ? (
                <TransactionContext
                  tx={tx}
                  item={item}
                  userId={user.id}
                  handover={handover}
                  dispatch={dispatch}
                  onSchedule={() => setShowSchedule(true)}
                  evidence={evidence}
                  setEvidence={setEvidence}
                  onConfirm={confirmHandover}
                />
              ) : null}
            </div>
            <div className="space-y-3 overflow-y-auto bg-background px-4 py-5 sm:px-6">
              {messages.map((msg) => {
                const mine = msg.sender === user.id;
                if (msg.sender === 'system')
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="rounded-md bg-surface-container px-3 py-1.5 text-center text-[11px] text-text-muted">
                        {msg.text}
                      </span>
                    </div>
                  );
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[82%] rounded-lg px-3.5 py-2.5 text-sm leading-6 sm:max-w-[70%] ${mine ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm bg-white text-text-primary ring-1 ring-border/70'}`}
                    >
                      {msg.type === 'handover_card' ? (
                        <span className="flex items-center gap-2">
                          <Icon name="calendar" className="size-4" />
                          {msg.text}
                        </span>
                      ) : (
                        msg.text
                      )}
                      <span
                        className={`mt-1 block text-[10px] ${mine ? 'text-white/65' : 'text-text-muted'}`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 border-t border-border bg-white p-3 sm:p-4"
            >
              <Field
                className="h-11"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <Button aria-label="Gửi tin nhắn" icon="send">
                Gửi
              </Button>
            </form>
          </section>
        ) : (
          <div className="hidden place-items-center lg:grid">
            <EmptyState
              icon="messages"
              title="Chọn một cuộc trò chuyện"
              text="Tin nhắn và thông tin giao dịch sẽ hiển thị tại đây."
            />
          </div>
        )}
      </div>
      {showSchedule && tx ? (
        <div
          className="fixed inset-0 z-40 grid place-items-end bg-black/30 p-0 sm:place-items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-lg sm:max-w-lg sm:rounded-xl sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Chốt lịch giao nhận</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Người còn lại cần đồng ý trước khi lịch được xác nhận.
                </p>
              </div>
              <IconButton icon="close" label="Đóng" onClick={() => setShowSchedule(false)} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Ngày"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Field
                label="Giờ"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <Select
                label="Phương thức"
                value={method}
                onChange={(e) => setMethod(e.target.value as typeof method)}
              >
                <option>Gặp trực tiếp</option>
                <option>Giao hàng</option>
              </Select>
              <Select label="Quận" value={district} onChange={(e) => setDistrict(e.target.value)}>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </div>
            <Field
              className="mt-4"
              label="Địa điểm cụ thể"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tên địa điểm, số nhà, đường..."
            />
            <TextArea
              className="mt-4"
              label="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowSchedule(false)}>
                Hủy
              </Button>
              <Button onClick={propose}>Gửi đề xuất lịch</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ContextProps = {
  tx: Transaction;
  item: Item;
  userId: string;
  handover: Handover | undefined;
  dispatch: AppDispatch;
  onSchedule: () => void;
  evidence: string[];
  setEvidence: Dispatch<SetStateAction<string[]>>;
  onConfirm: () => void;
};
function TransactionContext({
  tx,
  item,
  userId,
  handover,
  dispatch,
  onSchedule,
  evidence,
  setEvidence,
  onConfirm,
}: ContextProps) {
  void item;
  const index = progressIndex(tx.status);
  const isOwner = userId === tx.ownerId;
  const terminal = ['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(tx.status);
  return (
    <div className="border-t border-border px-4 pb-4 pt-3 sm:px-5">
      <div className="grid grid-cols-5 gap-1">
        {steps.map((step, i) => (
          <div key={step} className="min-w-0">
            <div className={`h-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-surface-high'}`} />
            <span className="mt-1.5 hidden truncate text-[9px] text-text-muted sm:block">
              {step}
            </span>
          </div>
        ))}
      </div>
      {handover ? (
        <div className="mt-3 flex flex-col gap-2 rounded-md bg-white p-3 text-xs ring-1 ring-border/70 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong>
              {handover.date} lúc {handover.time}
            </strong>
            <p className="mt-1 text-text-muted">
              {handover.method} · {handover.address}, {handover.district}
            </p>
          </div>
          {handover.status === 'proposed' && handover.proposedBy !== userId ? (
            <Button
              size="sm"
              onClick={() => dispatch(actions.acceptHandover({ handoverId: handover.id, userId }))}
            >
              Đồng ý lịch
            </Button>
          ) : (
            <span className="font-semibold text-success">
              {handover.status === 'confirmed' ? 'Đã thống nhất' : 'Chờ phản hồi'}
            </span>
          )}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {!terminal ? (
          <>
            <Button size="sm" variant="outline" icon="calendar" onClick={onSchedule}>
              {handover ? 'Đề xuất lịch khác' : 'Chốt lịch giao nhận'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon="wallet"
              disabled={
                tx.creditHeldBy.includes(userId) ||
                tx.status === 'NEGOTIATING' ||
                tx.status === 'SCHEDULE_PROPOSED'
              }
              onClick={() => dispatch(actions.holdTransactionFee({ transactionId: tx.id, userId }))}
            >
              {tx.creditHeldBy.includes(userId) ? 'Đã giữ phí' : 'Xác nhận giữ phí'}
            </Button>
          </>
        ) : null}
      </div>
      {tx.creditHeldBy.includes(userId) && !terminal ? (
        <div className="mt-3 rounded-md border border-dashed border-border p-3">
          <p className="text-xs font-semibold">
            {isOwner ? 'Xác nhận đã giao đồ' : 'Xác nhận đã nhận đồ'}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            Thêm ảnh hoặc video làm bằng chứng trước khi xác nhận.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {evidence.map((source, i) => (
              <span
                key={source.slice(-16) + i}
                className="relative block size-16 overflow-hidden rounded-md bg-surface-low"
              >
                {source.startsWith('data:video') ? (
                  <video
                    src={source}
                    className="size-full object-cover"
                    aria-label="Video bằng chứng"
                  />
                ) : (
                  <img src={source} alt="Ảnh bằng chứng" className="size-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setEvidence(evidence.filter((_, x) => x !== i))}
                  aria-label="Xóa bằng chứng"
                  className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-white text-error"
                >
                  <Icon name="close" className="size-3" />
                </button>
              </span>
            ))}
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary hover:border-primary">
              <Icon name="image" className="size-4" />
              Thêm bằng chứng
              <input
                className="hidden"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);
                  setEvidence([...evidence, ...(await Promise.all(files.map(fileToDataUrl)))]);
                }}
              />
            </label>
            <Button size="sm" onClick={onConfirm}>
              {isOwner ? 'Đã giao đồ' : 'Đã nhận đồ'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
