import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Avatar,
  Button,
  EmptyState,
  Field,
  Icon,
  PageHeader,
  SearchField,
  Select,
  Stat,
  StatusBadge,
  TextArea,
  TypeBadge,
} from '../../components/ui';
import { CATEGORIES } from '../../constants/domain';
import { formatVnd } from '../../utils/formatting';
import type { AppStateData, ComplaintStatus, ForbiddenKeyword, Item, KeywordAction, RankRule, ReputationPointRule, SupportedDistrict, Transaction } from '../../types/domain';

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <PageHeader title={title} description={description} action={action} />
      {children}
    </section>
  );
}
function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-lg bg-white p-3 ring-1 ring-border/80 sm:flex-row sm:items-center">
      {children}
    </div>
  );
}

export function AdminDashboard() {
  const data = useAppSelector(selectData);
  const pending = data.items.filter((i) => i.status === 'pending');
  const activeTx = data.transactions.filter((t) => !['COMPLETED', 'CANCELLED'].includes(t.status));
  return (
    <Panel
      title="Tổng quan vận hành"
      description="Tình hình cộng đồng và các công việc cần xử lý hôm nay."
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Thành viên" value={data.users.length} detail="+2 trong 7 ngày" />
        <Stat label="Bài chờ duyệt" value={pending.length} detail="Cần kiểm tra nội dung" />
        <Stat label="Giao dịch đang mở" value={activeTx.length} />
        <Stat
          label="Credit đang giữ"
          value={data.users.reduce((s, u) => s + u.holdCredit, 0)}
          detail="Chưa ghi nhận doanh thu"
        />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Việc cần xử lý</h2>
            <Link to="/admin/moderation" className="text-xs font-semibold text-primary">
              Xem hàng chờ
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Công việc</th>
                  <th>Đối tượng</th>
                  <th>Mức độ</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">Duyệt bài đăng mới</td>
                  <td>{pending.length} bài</td>
                  <td>
                    <span className="text-warning">Cần xử lý</span>
                  </td>
                  <td>Hôm nay</td>
                </tr>
                <tr>
                  <td className="font-semibold">Top-up chờ xác nhận</td>
                  <td>{data.topups.filter((t) => t.status === 'pending').length} yêu cầu</td>
                  <td>Thông thường</td>
                  <td>15 phút trước</td>
                </tr>
                <tr>
                  <td className="font-semibold">Giao dịch cần theo dõi</td>
                  <td>
                    {data.complaints.filter((item) => item.status !== 'resolved').length} khiếu nại
                  </td>
                  <td>
                    <span className="text-error">Ưu tiên</span>
                  </td>
                  <td>1 giờ trước</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="mb-3 section-title">Hoạt động gần đây</h2>
          <div className="rounded-lg bg-white px-4 ring-1 ring-border/80">
            {data.auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="border-b border-border/70 py-3 last:border-0">
                <p className="text-sm font-semibold">{log.detail}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Panel>
  );
}

export function AdminModeration() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [rejecting, setRejecting] = useState<Item | null>(null);
  const [toast, setToast] = useState('');
  const rows = data.items
    .filter((i) => i.status === 'pending')
    .filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <Panel
      title="Duyệt bài"
      description="Kiểm tra nội dung, hình ảnh và tính phù hợp trước khi hiển thị."
    >
      <FilterBar>
        <div className="flex-1">
          <SearchField
            placeholder="Tìm theo tiêu đề..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="text-xs text-text-muted">{rows.length} bài đang chờ</span>
      </FilterBar>
      <div className="space-y-3">
        {rows.map((item) => {
          const owner = data.users.find((u) => u.id === item.ownerId);
          return (
            <article
              key={item.id}
              className="grid gap-4 rounded-lg bg-white p-4 ring-1 ring-border/80 md:grid-cols-[96px_1fr_auto] md:items-center"
            >
              <img
                src={item.images[0]}
                alt={item.title}
                className="aspect-square w-full rounded-md object-cover md:size-24"
              />
              <div className="min-w-0">
                <div className="flex gap-2">
                  <TypeBadge type={item.type} />
                  <span className="text-xs text-text-muted">{item.category}</span>
                </div>
                <h2 className="mt-2 truncate font-bold">{item.title}</h2>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-muted">
                  {item.description}
                </p>
                <p className="mt-2 text-xs font-medium">
                  {owner?.name} · {item.district}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setRejecting(item)}
                >
                  Từ chối
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    dispatch(
                      actions.updateItemStatus({
                        itemId: item.id,
                        status: 'approved',
                        adminId: admin.id,
                      }),
                    )
                  }
                >
                  Duyệt bài
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
      {rejecting ? (
        <RejectPostModal
          item={rejecting}
          onClose={() => setRejecting(null)}
          onConfirm={(reason) => {
            dispatch(
              actions.updateItemStatus({
                itemId: rejecting.id,
                status: 'rejected',
                adminId: admin.id,
                rejectionReason: reason,
              }),
            );
            setRejecting(null);
            setToast('Đã từ chối bài đăng.');
          }}
        />
      ) : null}
    </Panel>
  );
}

const rejectionOptions = [
  'Danh mục không phù hợp',
  'Nội dung không rõ ràng',
  'Hình ảnh không phù hợp',
  'Sản phẩm thuộc danh mục bị cấm',
  'Nội dung có dấu hiệu vi phạm',
  'Khác',
];

function RejectPostModal({
  item,
  onClose,
  onConfirm,
}: {
  item: Item;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onConfirm: (..._args: [string]) => void;
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');
  const reason = [selectedReason, detail.trim()].filter(Boolean).join(' - ');
  return (
    <Modal title="Từ chối bài đăng" onClose={onClose}>
      <p className="text-sm leading-6 text-text-muted">
        Vui lòng cho biết lý do bài đăng không được duyệt.
      </p>
      <div className="mt-4 grid gap-2">
        {rejectionOptions.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <input
              type="radio"
              name={`reject-${item.id}`}
              checked={selectedReason === option}
              onChange={() => {
                setSelectedReason(option);
                setError('');
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <TextArea
        className="mt-4"
        label="Lý do chi tiết"
        placeholder="Nhập lý do từ chối để người đăng biết cần chỉnh sửa nội dung nào..."
        value={detail}
        error={error}
        onChange={(event) => {
          setDetail(event.target.value);
          setError('');
        }}
      />
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button
          variant="danger"
          onClick={() => {
            if (!reason.trim()) {
              setError('Vui lòng nhập lý do từ chối.');
              return;
            }
            onConfirm(reason);
          }}
        >
          Xác nhận từ chối
        </Button>
      </div>
    </Modal>
  );
}

export function AdminUsers() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = data.users
    .filter((u) => `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(query.toLowerCase()))
    .filter((u) => !status || u.status === status);
  return (
    <Panel
      title="Danh sách người dùng"
      description="Tra cứu hồ sơ, trạng thái và hoạt động tài khoản."
    >
      <FilterBar>
        <div className="flex-1">
          <SearchField
            placeholder="Tên, email hoặc số điện thoại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-44"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Đã khóa</option>
          <option value="suspended">Tạm khóa</option>
        </select>
      </FilterBar>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Khu vực</th>
              <th>Credit</th>
              <th>Uy tín</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link
                    to={`/admin/users/${u.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {u.name}
                  </Link>
                  <p className="mt-1 text-xs text-text-muted">{u.email}</p>
                </td>
                <td>{u.district}</td>
                <td className="tabular-nums">
                  {u.availableCredit} / {u.holdCredit} giữ
                </td>
                <td>
                  {u.reputationStars.toFixed(1)} · {u.rank}
                </td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
                <td>
                  {u.role !== 'admin' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        dispatch(
                          actions.lockUser({
                            adminId: admin.id,
                            userId: u.id,
                            locked: u.status !== 'locked',
                          }),
                        )
                      }
                    >
                      {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function AdminUserDetail() {
  const { userId } = useParams();
  const data = useAppSelector(selectData);
  const u = data.users.find((x) => x.id === userId);
  if (!u)
    return (
      <Panel title="Không tìm thấy người dùng">
        <p>Hồ sơ không tồn tại.</p>
      </Panel>
    );
  const txs = data.transactions.filter((t) => t.ownerId === u.id || t.requesterId === u.id);
  const creditHistory = data.creditHistory.filter((entry) => entry.userId === u.id);
  const pointHistory = data.pointHistory.filter((entry) => entry.userId === u.id);
  return (
    <Panel
      title={u.name}
      description={`${u.email} · ${u.phone} · ${u.district}`}
      action={<StatusBadge status={u.status} />}
    >
      <div className="space-y-6">
        <section className="grid gap-5 rounded-lg bg-white p-5 ring-1 ring-border/80 sm:grid-cols-3">
          <Stat label="Credit khả dụng" value={u.availableCredit} />
          <Stat label="Credit đang giữ" value={u.holdCredit} />
          <Stat label="Tổng giao dịch" value={txs.length} />
        </section>
        <section>
          <h2 className="mb-3 section-title">Lịch sử Credit</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Nội dung</th>
                  <th>Thay đổi</th>
                  <th>Số dư</th>
                </tr>
              </thead>
              <tbody>
                {creditHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{entry.note}</td>
                    <td className={entry.amount < 0 ? 'text-error' : 'text-success'}>
                      {entry.amount > 0 ? '+' : ''}
                      {entry.amount}
                    </td>
                    <td>{entry.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="mb-3 section-title">Lịch sử điểm</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Sự kiện</th>
                  <th>Thay đổi</th>
                  <th>Điểm sau thay đổi</th>
                </tr>
              </thead>
              <tbody>
                {pointHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{entry.event}</td>
                    <td className={entry.change < 0 ? 'text-error' : 'text-success'}>
                      {entry.change > 0 ? '+' : ''}{entry.change}
                    </td>
                    <td>{entry.pointsAfter}</td>
                  </tr>
                ))}
                {!pointHistory.length ? (
                  <tr>
                    <td colSpan={4} className="text-text-muted">Chưa có lịch sử điểm.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="mb-3 section-title">Giao dịch gần đây</h2>
          <div className="table-wrap">
            <table className="data-table">
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <Link
                        className="font-semibold text-primary"
                        to={`/admin/transactions/${tx.id}`}
                      >
                        {tx.id}
                      </Link>
                    </td>
                    <td>{data.items.find((i) => i.id === tx.itemId)?.title}</td>
                    <td>
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Panel>
  );
}

export function AdminTransactions() {
  const data = useAppSelector(selectData);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = data.transactions
    .filter((tx) =>
      `${tx.id} ${data.items.find((i) => i.id === tx.itemId)?.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .filter((tx) => !status || tx.status === status);
  return (
    <Panel title="Giao dịch" description="Theo dõi tiến trình, Credit Hold và xác nhận bàn giao.">
      <FilterBar>
        <div className="flex-1">
          <SearchField
            placeholder="Mã giao dịch hoặc tên món..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-52"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="NEGOTIATING">Đang thương lượng</option>
          <option value="SCHEDULE_CONFIRMED">Đã chốt lịch</option>
          <option value="WAITING_HANDOVER">Chờ bàn giao</option>
          <option value="COMPLETED">Hoàn tất</option>
          <option value="DISPUTED">Khiếu nại</option>
        </select>
      </FilterBar>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã giao dịch</th>
              <th>Món đồ</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Credit Hold</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <Link to={`/admin/transactions/${tx.id}`} className="font-semibold text-primary">
                    {tx.id}
                  </Link>
                </td>
                <td className="max-w-[220px] truncate">
                  {data.items.find((i) => i.id === tx.itemId)?.title}
                </td>
                <td>{tx.type === 'gift' ? 'Cho tặng' : 'Trao đổi'}</td>
                <td>
                  <StatusBadge status={tx.status} />
                </td>
                <td>{tx.creditHeldBy.length} bên</td>
                <td>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function AdminTransactionDetail() {
  const { transactionId } = useParams();
  const data = useAppSelector(selectData);
  const tx = data.transactions.find((t) => t.id === transactionId);
  if (!tx)
    return (
      <Panel title="Không tìm thấy giao dịch">
        <p>Giao dịch không tồn tại.</p>
      </Panel>
    );
  const item = data.items.find((i) => i.id === tx.itemId)!;
  const owner = data.users.find((u) => u.id === tx.ownerId)!;
  const requester = data.users.find((u) => u.id === tx.requesterId)!;
  const ho = data.handovers.find((h) => h.id === tx.handoverId);
  return (
    <Panel
      title={tx.id}
      description="Chi tiết đầy đủ của giao dịch và dấu vết xác nhận."
      action={<StatusBadge status={tx.status} />}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg bg-white p-5 ring-1 ring-border/80">
            <div className="flex gap-4">
              <img
                src={item.images[0]}
                alt={item.title}
                className="size-24 rounded-md object-cover"
              />
              <div>
                <TypeBadge type={item.type} />
                <h2 className="mt-2 font-bold">{item.title}</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {owner.name} ↔ {requester.name}
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-lg bg-white p-5 ring-1 ring-border/80">
            <h2 className="section-title">Bàn giao</h2>
            {ho ? (
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <Info label="Thời gian" value={`${ho.date}, ${ho.time}`} />
                <Info label="Phương thức" value={ho.method} />
                <Info label="Địa điểm" value={`${ho.address}, ${ho.district}`} />
                <Info
                  label="Trạng thái"
                  value={ho.status === 'confirmed' ? 'Đã thống nhất' : 'Chờ phản hồi'}
                />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-text-muted">Hai bên chưa đề xuất lịch giao nhận.</p>
            )}
          </section>
        </div>
        <aside className="h-fit rounded-lg bg-white p-5 ring-1 ring-border/80">
          <h2 className="section-title">Kiểm soát giao dịch</h2>
          <div className="mt-4 space-y-4">
            <Info
              label="Bên đã giữ phí"
              value={tx.creditHeldBy.length ? `${tx.creditHeldBy.length} bên` : 'Chưa có'}
            />
            <Info
              label="Người gửi xác nhận"
              value={tx.senderConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
            />
            <Info
              label="Người nhận xác nhận"
              value={tx.receiverConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
            />
            <Info
              label="Bằng chứng"
              value={`${(tx.senderEvidence?.length ?? 0) + (tx.receiverEvidence?.length ?? 0)} tệp`}
            />
          </div>
        </aside>
      </div>
    </Panel>
  );
}

export function AdminFinance() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const pending = data.topups.filter((t) => t.status === 'pending');
  return (
    <Panel
      title="Báo cáo tài chính"
      description="Credit phát hành, đang giữ và các yêu cầu nạp tiền."
    >
      <div className="grid gap-5 sm:grid-cols-4">
        <Stat
          label="Credit toàn hệ thống"
          value={data.users.reduce((s, u) => s + u.totalCredit, 0)}
        />
        <Stat label="Credit đang giữ" value={data.users.reduce((s, u) => s + u.holdCredit, 0)} />
        <Stat label="Doanh thu hệ thống" value={data.systemRevenue} />
        <Stat label="Top-up chờ duyệt" value={pending.length} />
      </div>
      <h2 className="mb-3 mt-8 section-title">Yêu cầu top-up</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Số tiền</th>
              <th>Credit</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.topups.map((t) => {
              const u = data.users.find((x) => x.id === t.userId);
              return (
                <tr key={t.id}>
                  <td>{u?.name}</td>
                  <td>{formatVnd(t.vnd)}</td>
                  <td>{t.amount}</td>
                  <td>{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <span className={t.status === 'completed' ? 'text-success' : 'text-warning'}>
                      {t.status === 'completed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                    </span>
                  </td>
                  <td>
                    {t.status !== 'completed' ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          dispatch(actions.confirmTopup({ topupId: t.id, adminId: admin.id }))
                        }
                      >
                        Xác nhận
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function AdminFinanceUserLookup() {
  const data = useAppSelector(selectData);
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const rows = normalized
    ? data.users.filter((user) =>
        `${user.name} ${user.username} ${user.email} ${user.phone}`
          .toLowerCase()
          .includes(normalized),
      )
    : [];
  return (
    <Panel
      title="Tra cứu người dùng"
      description="Tìm người dùng trước khi xem chi tiết tài chính và lịch sử giao dịch."
    >
      <FilterBar>
        <div className="flex-1">
          <SearchField
            placeholder="Tìm theo tên, email, số điện thoại hoặc tên tài khoản..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </FilterBar>
      {rows.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Username</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Credit khả dụng</th>
                <th>Credit đang giữ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar user={user} />
                      <span className="font-semibold">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.availableCredit}</td>
                  <td>{user.holdCredit}</td>
                  <td><StatusBadge status={user.status} /></td>
                  <td>
                    <Link to={`/admin/finance/users/${user.id}`}>
                      <Button size="sm" variant="outline">Xem chi tiết</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="search"
          title={query ? 'Không tìm thấy người dùng' : 'Nhập từ khóa để tra cứu'}
          text="Kết quả sẽ hiển thị sau khi bạn nhập tên, email, số điện thoại hoặc username."
        />
      )}
    </Panel>
  );
}

export function AdminSettings() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [fee, setFee] = useState(
    Number(data.settings.find((s) => s.key === 'tx_fee_credit')?.value ?? 200),
  );
  return (
    <Panel title="Phí & hạn mức" description="Cấu hình áp dụng cho các giao dịch mới.">
      <div className="max-w-2xl rounded-lg bg-white p-6 ring-1 ring-border/80">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            type="number"
            label="Phí giao dịch (Credit)"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            hint="Swap: 200 mỗi bên. Give: người nhận 400."
          />
          <Field
            type="number"
            label="Hạn mức top-up/ngày"
            value={20000}
            readOnly
            hint="Giá trị demo bằng VND."
          />
        </div>
        <div className="mt-5 rounded-md bg-primary-faint p-4 text-sm text-text-secondary">
          1 Credit = 1 VND. Swap thu 200 Credit mỗi bên; Give thu 400 Credit từ người nhận.
        </div>
        <Button
          className="mt-5"
          onClick={() => dispatch(actions.updateFeeSetting({ adminId: admin.id, fee }))}
        >
          Lưu cấu hình
        </Button>
        <div className="mt-8 border-t border-border pt-5">
          <h3 className="text-sm font-bold">Dữ liệu demo</h3>
          <p className="mt-1 text-xs leading-5 text-text-muted">
            Khôi phục toàn bộ người dùng, món đồ, giao dịch và cấu hình về trạng thái ban đầu.
          </p>
          <Button
            className="mt-3"
            variant="danger"
            onClick={() => dispatch(actions.resetDemoData())}
          >
            Reset Demo Data
          </Button>
        </div>
      </div>
    </Panel>
  );
}

export function AdminAuditLogs() {
  const data = useAppSelector(selectData);
  return (
    <Panel title="Audit Log" description="Dấu vết bất biến của các thao tác quản trị.">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>Chi tiết</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {data.auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                </td>
                <td className="font-mono text-xs">{log.action}</td>
                <td>
                  {log.targetType} · {log.targetId}
                </td>
                <td>{log.detail}</td>
                <td>{data.users.find((u) => u.id === log.adminId)?.name ?? log.adminId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function AdminContentPage({
  kind,
}: {
  kind:
    | 'expired'
    | 'categories'
    | 'keywords'
    | 'districts'
    | 'reputation'
    | 'locked'
    | 'disputes'
    | 'alerts'
    | 'ranks';
}) {
  if (kind === 'keywords') return <AdminKeywords />;
  if (kind === 'districts') return <AdminDistricts />;
  if (kind === 'disputes') return <AdminComplaints />;
  if (kind === 'ranks') return <AdminRanks />;
  if (kind === 'reputation') return <AdminReputation />;
  return <AdminStaticContent kind={kind} />;
}

function AdminKeywords() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<ForbiddenKeyword | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ForbiddenKeyword | null>(null);
  return (
    <Panel
      title="Từ khóa cấm"
      description="Các cụm từ được dùng khi kiểm tra nội dung bài đăng."
      action={<Button icon="add" onClick={() => setEditing({ id: '', keyword: '', detections: 0, action: 'flag' })}>Thêm từ khóa</Button>}
    >
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Từ khóa</th>
              <th>Số lần phát hiện</th>
              <th>Mức xử lý</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.keywords.map((keyword) => (
              <tr key={keyword.id}>
                <td className="font-semibold">{keyword.keyword}</td>
                <td>{keyword.detections}</td>
                <td>{keyword.action === 'block' ? 'Chặn bài' : 'Tự động gắn cờ'}</td>
                <td className="space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(keyword)}>Sửa</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(keyword)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <KeywordModal
          keyword={editing}
          onClose={() => setEditing(null)}
          onSave={(keyword, action) => {
            if (editing.id) {
              dispatch(actions.updateKeyword({ adminId: admin.id, id: editing.id, keyword, action }));
            } else {
              dispatch(actions.addKeyword({ adminId: admin.id, keyword, action }));
            }
            setEditing(null);
          }}
        />
      ) : null}
      {confirmDelete ? (
        <ConfirmDialog
          title="Xóa từ khóa?"
          text={`Từ khóa "${confirmDelete.keyword}" sẽ không còn được dùng để kiểm tra bài đăng.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            dispatch(actions.deleteKeyword({ adminId: admin.id, id: confirmDelete.id }));
            setConfirmDelete(null);
          }}
        />
      ) : null}
    </Panel>
  );
}

function KeywordModal({
  keyword,
  onClose,
  onSave,
}: {
  keyword: ForbiddenKeyword;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (..._args: [string, KeywordAction]) => void;
}) {
  const [value, setValue] = useState(keyword.keyword);
  const [action, setAction] = useState<KeywordAction>(keyword.action);
  return (
    <Modal title={keyword.id ? 'Sửa từ khóa' : 'Thêm từ khóa'} onClose={onClose}>
      <Field label="Từ khóa" value={value} onChange={(event) => setValue(event.target.value)} />
      <Select
        className="mt-4"
        label="Mức xử lý"
        value={action}
        onChange={(event) => setAction(event.target.value as KeywordAction)}
      >
        <option value="flag">Tự động gắn cờ</option>
        <option value="block">Chặn bài</option>
      </Select>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSave(value, action)}>Lưu</Button>
      </div>
    </Modal>
  );
}

function AdminDistricts() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<SupportedDistrict | null>(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<SupportedDistrict | null>(null);
  return (
    <Panel
      title="Khu vực"
      description="Danh sách khu vực dùng chung cho tìm đồ, trợ lý AI và đăng đồ."
      action={<Button icon="add" onClick={() => setEditing({ id: '', name: '', status: 'active' })}>Thêm khu vực</Button>}
    >
      {error ? <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-error">{error}</div> : null}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Khu vực</th>
              <th>Số món</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.districts.map((district) => (
              <tr key={district.id}>
                <td className="font-semibold">{district.name}</td>
                <td>{data.items.filter((item) => item.district === district.name).length}</td>
                <td>Đang hỗ trợ</td>
                <td className="space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(district)}>Sửa</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(district)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <DistrictModal
          district={editing}
          onClose={() => setEditing(null)}
          onSave={(name) => {
            const duplicate = data.districts.some(
              (entry) => entry.id !== editing.id && entry.name.toLowerCase() === name.trim().toLowerCase(),
            );
            if (duplicate) {
              setError('Khu vực đã tồn tại.');
              return;
            }
            if (editing.id) dispatch(actions.updateDistrict({ adminId: admin.id, id: editing.id, name }));
            else dispatch(actions.addDistrict({ adminId: admin.id, name }));
            setError('');
            setEditing(null);
          }}
        />
      ) : null}
      {confirmDelete ? (
        <ConfirmDialog
          title="Xóa khu vực?"
          text={`Khu vực "${confirmDelete.name}" sẽ biến mất khỏi các dropdown tìm kiếm và đăng đồ.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            dispatch(actions.deleteDistrict({ adminId: admin.id, id: confirmDelete.id }));
            setConfirmDelete(null);
          }}
        />
      ) : null}
    </Panel>
  );
}

function DistrictModal({
  district,
  onClose,
  onSave,
}: {
  district: SupportedDistrict;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (..._args: [string]) => void;
}) {
  const [name, setName] = useState(district.name);
  return (
    <Modal title={district.id ? 'Sửa khu vực' : 'Thêm khu vực'} onClose={onClose}>
      <Field label="Tên khu vực" value={name} onChange={(event) => setName(event.target.value)} />
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSave(name)}>Lưu</Button>
      </div>
    </Modal>
  );
}

function AdminComplaints() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [resolution, setResolution] = useState('');
  const selected = data.complaints.find((entry) => entry.id === selectedId);
  const statusLabel: Record<ComplaintStatus, string> = {
    received: 'Đã tiếp nhận',
    processing: 'Đang xử lý',
    resolved: 'Đã xử lý',
  };
  return (
    <Panel title="Khiếu nại" description="Hồ sơ giao dịch cần quản trị viên xem xét và xử lý.">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Người gửi</th>
              <th>Giao dịch</th>
              <th>Lý do</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td className="font-semibold">{complaint.id}</td>
                <td>{data.users.find((user) => user.id === complaint.reporterId)?.name}</td>
                <td>{complaint.transactionId}</td>
                <td>{complaint.reason}</td>
                <td>{new Date(complaint.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>{statusLabel[complaint.status]}</td>
                <td>
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedId(complaint.id);
                    setNote(complaint.adminNote ?? '');
                    setResolution(complaint.resolution ?? '');
                  }}>
                    Xem chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected ? (
        <Modal title={`Khiếu nại ${selected.id}`} onClose={() => setSelectedId('')}>
          <div className="grid gap-3 text-sm">
            <Info label="Người gửi" value={data.users.find((user) => user.id === selected.reporterId)?.name ?? selected.reporterId} />
            <Info label="Người bị khiếu nại" value={data.users.find((user) => user.id === selected.reportedUserId)?.name ?? selected.reportedUserId} />
            <Info label="Giao dịch liên quan" value={selected.transactionId} />
            <Info label="Trạng thái" value={statusLabel[selected.status]} />
          </div>
          <div className="mt-4 rounded-md bg-background p-3 text-sm leading-6 text-text-secondary">
            <strong className="text-text-primary">{selected.reason}</strong>
            <p className="mt-1">{selected.content}</p>
          </div>
          {selected.evidence.length ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {selected.evidence.map((source, index) => (
                source.startsWith('data:video') ? (
                  <video key={source.slice(-16) + index} src={source} className="aspect-square rounded-md object-cover" controls />
                ) : (
                  <img key={source.slice(-16) + index} src={source} alt="Bằng chứng" className="aspect-square rounded-md object-cover" />
                )
              ))}
            </div>
          ) : null}
          <TextArea className="mt-4" label="Ghi chú xử lý" value={note} onChange={(event) => setNote(event.target.value)} />
          <TextArea className="mt-4" label="Kết quả xử lý" value={resolution} onChange={(event) => setResolution(event.target.value)} />
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedId('')}>Đóng</Button>
            {selected.status === 'received' ? (
              <Button
                onClick={() => dispatch(actions.updateComplaintStatus({ adminId: admin.id, complaintId: selected.id, status: 'processing', adminNote: note }))}
              >
                Chuyển đang xử lý
              </Button>
            ) : null}
            {selected.status === 'processing' ? (
              <Button
                onClick={() => {
                  dispatch(actions.updateComplaintStatus({ adminId: admin.id, complaintId: selected.id, status: 'resolved', adminNote: note, resolution }));
                  setSelectedId('');
                }}
              >
                Đánh dấu đã xử lý
              </Button>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </Panel>
  );
}

function AdminRanks() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<RankRule | null>(null);
  const [toast, setToast] = useState('');
  const rows = [...data.ranks].sort((a, b) => a.minPoints - b.minPoints);
  return (
    <Panel
      title="Mốc hạng"
      description="Cấu hình khoảng điểm dùng để xác định hạng thành viên."
      action={<Button icon="add" onClick={() => setEditing(emptyRank())}>Thêm mốc hạng</Button>}
    >
      <RankTable ranks={rows} onEdit={setEditing} />
      {editing ? (
        <RankModal
          rank={editing}
          onClose={() => setEditing(null)}
          onSave={(name, minPoints, maxPoints, benefits, status) => {
            if (editing.id) {
              dispatch(actions.updateRankRule({ adminId: admin.id, id: editing.id, name, minPoints, maxPoints, benefits, status }));
            } else {
              dispatch(actions.addRankRule({ adminId: admin.id, name, minPoints, maxPoints, benefits, status }));
            }
            setEditing(null);
            setToast('Đã cập nhật mốc hạng thành công.');
          }}
        />
      ) : null}
      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
    </Panel>
  );
}

function RankModal({
  rank,
  onClose,
  onSave,
}: {
  rank: RankRule;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (..._args: [string, number, number | undefined, string, RankRule['status']]) => void;
}) {
  const [name, setName] = useState(rank.name);
  const [minPoints, setMinPoints] = useState(rank.minPoints);
  const [maxPoints, setMaxPoints] = useState(rank.maxPoints ?? '');
  const [benefits, setBenefits] = useState(rank.benefits ?? '');
  const [status, setStatus] = useState<RankRule['status']>(rank.status ?? 'active');
  return (
    <Modal title={rank.id ? 'Chỉnh sửa mốc hạng' : 'Thêm mốc hạng'} onClose={onClose}>
      <Field label="Tên hạng" value={name} onChange={(event) => setName(event.target.value)} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Điểm tối thiểu" type="number" value={minPoints} onChange={(event) => setMinPoints(Number(event.target.value))} />
        <Field label="Điểm tối đa" type="number" value={maxPoints} onChange={(event) => setMaxPoints(event.target.value === '' ? '' : Number(event.target.value))} />
      </div>
      <TextArea className="mt-4" label="Quyền lợi" value={benefits} onChange={(event) => setBenefits(event.target.value)} />
      <Select className="mt-4" label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value as RankRule['status'])}>
        <option value="active">Đang dùng</option>
        <option value="inactive">Tạm ẩn</option>
      </Select>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSave(name, minPoints, maxPoints === '' ? undefined : Number(maxPoints), benefits, status)}>Lưu thay đổi</Button>
      </div>
    </Modal>
  );
}

function emptyRank(): RankRule {
  return { id: '', name: '', minPoints: 0, benefits: '', status: 'active' };
}

function RankTable({
  ranks,
  onEdit,
}: {
  ranks: RankRule[];
  // eslint-disable-next-line no-unused-vars
  onEdit: (..._args: [RankRule]) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tên hạng</th>
            <th>Điểm tối thiểu</th>
            <th>Quyền lợi</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {ranks.map((rank) => (
            <tr key={rank.id}>
              <td className="font-semibold">{rank.name}</td>
              <td>{rank.minPoints}</td>
              <td>{rank.benefits || `${rank.minPoints} điểm trở lên`}</td>
              <td>{rank.status === 'inactive' ? 'Tạm ẩn' : 'Đang dùng'}</td>
              <td><Button size="sm" variant="ghost" onClick={() => onEdit(rank)}>Chỉnh sửa</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminReputation() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [editingRank, setEditingRank] = useState<RankRule | null>(null);
  const [editingRule, setEditingRule] = useState<ReputationPointRule | null>(null);
  const [toast, setToast] = useState('');
  const rankRows = [...data.ranks].sort((a, b) => a.minPoints - b.minPoints);
  return (
    <Panel title="Uy tín & Hạng" description="TrustStars và điểm hạng được theo dõi riêng biệt.">
      <section>
        <h2 className="mb-3 section-title">Uy tín người dùng</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>TrustStars</th>
                <th>Điểm hạng</th>
                <th>Hạng hiện tại</th>
              </tr>
            </thead>
            <tbody>
              {data.users.filter((user) => user.role !== 'admin').map((user) => (
                <tr key={user.id}>
                  <td className="font-semibold">{user.name}</td>
                  <td>{user.reputationStars.toFixed(1)} ★</td>
                  <td>{user.rewardPoints}</td>
                  <td>{user.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-8">
        <PageHeader
          title="Mốc hạng"
          action={<Button icon="add" onClick={() => setEditingRank(emptyRank())}>Thêm mốc hạng</Button>}
        />
        <RankTable ranks={rankRows} onEdit={setEditingRank} />
      </section>
      <section className="mt-8">
        <PageHeader
          title="Cấu hình cộng / trừ điểm"
          action={<Button icon="add" onClick={() => setEditingRule(emptyPointRule())}>Thêm quy tắc</Button>}
        />
        <PointRuleTable rules={data.pointRules} onEdit={setEditingRule} />
      </section>
      {editingRank ? (
        <RankModal
          rank={editingRank}
          onClose={() => setEditingRank(null)}
          onSave={(name, minPoints, maxPoints, benefits, status) => {
            if (editingRank.id) {
              dispatch(actions.updateRankRule({ adminId: admin.id, id: editingRank.id, name, minPoints, maxPoints, benefits, status }));
            } else {
              dispatch(actions.addRankRule({ adminId: admin.id, name, minPoints, maxPoints, benefits, status }));
            }
            setEditingRank(null);
            setToast('Đã cập nhật mốc hạng thành công.');
          }}
        />
      ) : null}
      {editingRule ? (
        <PointRuleModal
          rule={editingRule}
          onClose={() => setEditingRule(null)}
          onSave={(behavior, type, points, status, description) => {
            if (editingRule.id) {
              dispatch(actions.updatePointRule({ adminId: admin.id, id: editingRule.id, behavior, type, points, status, description }));
            } else {
              dispatch(actions.addPointRule({ adminId: admin.id, behavior, type, points, status, description }));
            }
            setEditingRule(null);
            setToast('Đã cập nhật quy tắc điểm thành công.');
          }}
        />
      ) : null}
      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
    </Panel>
  );
}

function emptyPointRule(): ReputationPointRule {
  return {
    id: '',
    key: `custom_${Date.now()}`,
    behavior: '',
    type: 'plus',
    points: 0,
    status: 'active',
    description: '',
  };
}

function PointRuleTable({
  rules,
  onEdit,
}: {
  rules: ReputationPointRule[];
  // eslint-disable-next-line no-unused-vars
  onEdit: (..._args: [ReputationPointRule]) => void;
}) {
  const typeLabel = { plus: 'Cộng', minus: 'Trừ' };
  const statusLabel = { active: 'Đang áp dụng', paused: 'Tạm dừng' };
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Hành vi</th>
            <th>Loại</th>
            <th>Điểm thay đổi</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td className="font-semibold">{rule.behavior}</td>
              <td>{typeLabel[rule.type]}</td>
              <td className={rule.type === 'plus' ? 'text-success' : 'text-error'}>
                {rule.type === 'plus' ? '+' : '-'}{rule.points}
              </td>
              <td>{statusLabel[rule.status]}</td>
              <td><Button size="sm" variant="ghost" onClick={() => onEdit(rule)}>Chỉnh sửa</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PointRuleModal({
  rule,
  onClose,
  onSave,
}: {
  rule: ReputationPointRule;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (..._args: [string, ReputationPointRule['type'], number, ReputationPointRule['status'], string]) => void;
}) {
  const [behavior, setBehavior] = useState(rule.behavior);
  const [type, setType] = useState<ReputationPointRule['type']>(rule.type);
  const [points, setPoints] = useState(rule.points);
  const [status, setStatus] = useState<ReputationPointRule['status']>(rule.status);
  const [description, setDescription] = useState(rule.description);
  return (
    <Modal title="Cấu hình quy tắc điểm" onClose={onClose}>
      <Field label="Tên hành vi" value={behavior} onChange={(event) => setBehavior(event.target.value)} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Select label="Loại" value={type} onChange={(event) => setType(event.target.value as ReputationPointRule['type'])}>
          <option value="plus">Cộng</option>
          <option value="minus">Trừ</option>
        </Select>
        <Field label="Số điểm" type="number" min={0} value={points} onChange={(event) => setPoints(Number(event.target.value))} />
      </div>
      <Select className="mt-4" label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value as ReputationPointRule['status'])}>
        <option value="active">Đang áp dụng</option>
        <option value="paused">Tạm dừng</option>
      </Select>
      <TextArea className="mt-4" label="Mô tả" value={description} onChange={(event) => setDescription(event.target.value)} />
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSave(behavior, type, points, status, description)}>Lưu thay đổi</Button>
      </div>
    </Modal>
  );
}

function AdminStaticContent({
  kind,
}: {
  kind: 'expired' | 'categories' | 'locked' | 'alerts';
}) {
  const data = useAppSelector(selectData);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryRow[]>(() =>
    CATEGORIES.map((name) => ({
      id: name,
      name,
      code: name.toLowerCase().replace(/\s+/g, '-'),
      description: `Danh mục ${name}`,
      status: 'active' as const,
    })),
  );
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState('');
  const [inspectedAlerts, setInspectedAlerts] = useState<string[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const configs = {
    expired: ['Bài quá hạn', 'Theo dõi và xử lý các bài đã hết thời gian hiển thị.'],
    categories: ['Danh mục', 'Quản lý cấu trúc danh mục dùng chung toàn hệ thống.'],
    locked: ['Tài khoản bị khóa', 'Các tài khoản bị hạn chế truy cập hệ thống.'],
    alerts: ['Cảnh báo bất thường', 'Tín hiệu cần kiểm tra từ hoạt động giao dịch và Credit.'],
  } as const;
  const [title, description] = configs[kind];
  const alertRows = data.transactions
    .filter((t) => t.status === 'DISPUTED' || t.creditHeldBy.length > 1)
    .filter((t) => !dismissedAlerts.includes(`alert_${t.id}`));
  const selectedTx = alertRows.find((tx) => `alert_${tx.id}` === selectedAlertId);
  const rows =
    kind === 'locked'
        ? data.users.filter((u) => u.status === 'locked').map((u) => [u.name, u.email, 'Đã khóa'])
        : kind === 'expired'
          ? data.items.filter((i) => i.status === 'expired').map((i) => [i.title, i.district, new Date(i.expiresAt).toLocaleDateString('vi-VN')])
          : [];
  if (kind === 'categories') {
    return (
      <Panel title={title} description={description}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên / Mã</th>
                <th>Thông tin</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="font-semibold">
                    {category.name}
                    <p className="mt-1 text-xs font-normal text-text-muted">{category.code}</p>
                  </td>
                  <td>{data.items.filter((x) => x.category === category.name).length} bài</td>
                  <td>{category.status === 'active' ? 'Đang dùng' : 'Tạm ẩn'}</td>
                  <td><Button size="sm" variant="ghost" onClick={() => setEditingCategory(category)}>Chỉnh sửa</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingCategory ? (
          <CategoryModal
            category={editingCategory}
            onClose={() => setEditingCategory(null)}
            onSave={(nextCategory) => {
              setCategories((current) =>
                current.map((entry) => entry.id === editingCategory.id ? { ...nextCategory, id: editingCategory.id } : entry),
              );
              setEditingCategory(null);
              setToast('Đã cập nhật danh mục thành công.');
            }}
          />
        ) : null}
        {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
      </Panel>
    );
  }
  if (kind === 'alerts') {
    return (
      <Panel title={title} description={description}>
        {alertRows.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên / Mã</th>
                  <th>Thông tin</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {alertRows.map((tx) => {
                  const alertId = `alert_${tx.id}`;
                  const isInspected = inspectedAlerts.includes(alertId);
                  return (
                    <tr key={alertId} className="cursor-pointer" onClick={() => setSelectedAlertId(alertId)}>
                      <td className="font-semibold">{alertId}</td>
                      <td>{tx.status === 'DISPUTED' ? 'Giao dịch có khiếu nại' : 'Nhiều bên đã giữ Credit'}</td>
                      <td>{isInspected ? 'Đã kiểm tra' : tx.status}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedAlertId(alertId);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Chưa có dữ liệu phù hợp" text="Các bản ghi mới sẽ xuất hiện tại đây." />
        )}
        {selectedTx ? (
          <AlertDetailModal
            transaction={selectedTx}
            data={data}
            inspected={inspectedAlerts.includes(`alert_${selectedTx.id}`)}
            onClose={() => setSelectedAlertId('')}
            onInspect={() => {
              setInspectedAlerts((current) => [...new Set([...current, `alert_${selectedTx.id}`])]);
              setToast('Đã đánh dấu cảnh báo đã kiểm tra.');
            }}
            onDismiss={() => {
              setDismissedAlerts((current) => [...new Set([...current, `alert_${selectedTx.id}`])]);
              setSelectedAlertId('');
              setToast('Đã bỏ qua cảnh báo.');
            }}
            onOpenTransaction={() => navigate(`/admin/transactions/${selectedTx.id}`)}
          />
        ) : null}
        {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
      </Panel>
    );
  }
  return (
    <Panel title={title} description={description}>
      <SimpleRows rows={rows} />
    </Panel>
  );
}

function SimpleRows({ rows }: { rows: string[][] }) {
  return rows.length ? (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tên / Mã</th>
            <th>Thông tin</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[0] + i}>
              <td className="font-semibold">{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <EmptyState title="Chưa có dữ liệu phù hợp" text="Các bản ghi mới sẽ xuất hiện tại đây." />
  );
}

type CategoryRow = {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'hidden';
};

function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: CategoryRow;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (..._args: [CategoryRow]) => void;
}) {
  const [name, setName] = useState(category.name);
  const [code, setCode] = useState(category.code);
  const [description, setDescription] = useState(category.description);
  const [status, setStatus] = useState<CategoryRow['status']>(category.status);
  return (
    <Modal title="Chỉnh sửa danh mục" onClose={onClose}>
      <Field label="Tên danh mục" value={name} onChange={(event) => setName(event.target.value)} />
      <Field className="mt-4" label="Mã danh mục" value={code} onChange={(event) => setCode(event.target.value)} />
      <TextArea className="mt-4" label="Mô tả" value={description} onChange={(event) => setDescription(event.target.value)} />
      <Select className="mt-4" label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value as CategoryRow['status'])}>
        <option value="active">Đang dùng</option>
        <option value="hidden">Tạm ẩn</option>
      </Select>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={() => onSave({ ...category, name, code, description, status })}>Lưu thay đổi</Button>
      </div>
    </Modal>
  );
}

function AlertDetailModal({
  transaction,
  data,
  inspected,
  onClose,
  onInspect,
  onOpenTransaction,
  onDismiss,
}: {
  transaction: Transaction;
  data: AppStateData;
  inspected: boolean;
  onClose: () => void;
  onInspect: () => void;
  onOpenTransaction: () => void;
  onDismiss: () => void;
}) {
  const item = data.items.find((entry) => entry.id === transaction.itemId);
  const owner = data.users.find((entry) => entry.id === transaction.ownerId);
  const requester = data.users.find((entry) => entry.id === transaction.requesterId);
  const alertId = `alert_${transaction.id}`;
  const alertType = transaction.status === 'DISPUTED' ? 'Giao dịch có khiếu nại' : 'Nhiều bên đã giữ Credit';
  const relatedLogs = data.auditLogs
    .filter((log) => log.targetId === transaction.id || log.targetId === transaction.itemId)
    .slice(0, 5);
  return (
    <Modal title="Chi tiết cảnh báo bất thường" onClose={onClose}>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Mã cảnh báo" value={alertId} />
        <Info label="Mã giao dịch" value={transaction.id} />
        <Info label="Người liên quan" value={[owner?.name, requester?.name].filter(Boolean).join(' ↔ ')} />
        <Info label="Loại cảnh báo" value={alertType} />
        <Info label="Thời gian phát hiện" value={new Date(transaction.createdAt).toLocaleString('vi-VN')} />
        <Info label="Trạng thái giao dịch" value={transaction.status} />
        <Info label="Credit liên quan" value={`${transaction.creditHeldBy.length} bên đã giữ Credit`} />
        <Info label="Trạng thái kiểm tra" value={inspected ? 'Đã kiểm tra' : 'Chưa kiểm tra'} />
      </div>
      <div className="mt-4 rounded-md bg-background p-3 text-sm leading-6 text-text-secondary">
        <p><strong className="text-text-primary">Nội dung cảnh báo:</strong> {item?.title ?? transaction.itemId}</p>
        <p className="mt-1"><strong className="text-text-primary">Lý do hệ thống đánh dấu:</strong> {alertType}</p>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-bold">Lịch sử hoạt động liên quan</h3>
        <div className="mt-2 space-y-2">
          {relatedLogs.length ? relatedLogs.map((log) => (
            <div key={log.id} className="rounded-md border border-border px-3 py-2 text-xs text-text-muted">
              <p className="font-semibold text-text-primary">{log.detail}</p>
              <p className="mt-0.5">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          )) : (
            <p className="text-sm text-text-muted">Chưa có lịch sử liên quan trong audit log.</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Đóng</Button>
        <Button variant="outline" onClick={onInspect}>Đánh dấu đã kiểm tra</Button>
        <Button variant="secondary" onClick={onOpenTransaction}>Xem giao dịch liên quan</Button>
        <Button variant="danger" onClick={onDismiss}>Bỏ qua cảnh báo</Button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-black/30 sm:place-items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-lg sm:max-w-xl sm:rounded-xl sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-md text-text-muted hover:bg-surface-low">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-lg bg-text-primary px-4 py-3 text-sm font-semibold text-white shadow-lg">
      <span>{message}</span>
      <button onClick={onClose} className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white">
        <Icon name="close" className="size-4" />
      </button>
    </div>
  );
}

function ConfirmDialog({
  title,
  text,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-text-muted">{text}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button variant="danger" onClick={onConfirm}>Xóa</Button>
      </div>
    </Modal>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}
