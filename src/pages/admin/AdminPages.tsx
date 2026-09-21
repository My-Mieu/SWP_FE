import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Button,
  Field,
  PageHeader,
  SearchField,
  Stat,
  StatusBadge,
  TypeBadge,
} from '../../components/ui';
import { CATEGORIES, DISTRICTS } from '../../constants/domain';
import { formatVnd } from '../../utils/formatting';

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
                    {data.transactions.filter((t) => t.status === 'DISPUTED').length} tranh chấp
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
                  onClick={() =>
                    dispatch(
                      actions.updateItemStatus({
                        itemId: item.id,
                        status: 'rejected',
                        adminId: admin.id,
                      }),
                    )
                  }
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
    </Panel>
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
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState(5);
  const u = data.users.find((x) => x.id === userId);
  if (!u)
    return (
      <Panel title="Không tìm thấy người dùng">
        <p>Hồ sơ không tồn tại.</p>
      </Panel>
    );
  const txs = data.transactions.filter((t) => t.ownerId === u.id || t.requesterId === u.id);
  return (
    <Panel
      title={u.name}
      description={`${u.email} · ${u.phone} · ${u.district}`}
      action={<StatusBadge status={u.status} />}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="grid gap-5 rounded-lg bg-white p-5 ring-1 ring-border/80 sm:grid-cols-3">
            <Stat label="Credit khả dụng" value={u.availableCredit} />
            <Stat label="Credit đang giữ" value={u.holdCredit} />
            <Stat label="Giao dịch" value={txs.length} />
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
        <aside className="h-fit rounded-lg bg-white p-5 ring-1 ring-border/80">
          <h2 className="section-title">Điều chỉnh Credit</h2>
          <p className="mt-1 text-xs leading-5 text-text-muted">
            Mọi thay đổi đều được ghi vào Audit Log.
          </p>
          <Field
            className="mt-4"
            type="number"
            label="Số Credit"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Button
            className="mt-3 w-full"
            onClick={() =>
              dispatch(
                actions.adminAdjustCredit({
                  adminId: admin.id,
                  userId: u.id,
                  amount,
                  note: `Điều chỉnh thủ công ${amount} Credit`,
                }),
              )
            }
          >
            Xác nhận điều chỉnh
          </Button>
        </aside>
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
          <option value="DISPUTED">Tranh chấp</option>
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
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat
          label="Credit toàn hệ thống"
          value={data.users.reduce((s, u) => s + u.totalCredit, 0)}
        />
        <Stat label="Credit đang giữ" value={data.users.reduce((s, u) => s + u.holdCredit, 0)} />
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

export function AdminSettings() {
  const data = useAppSelector(selectData);
  const admin = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const [fee, setFee] = useState(
    Number(data.settings.find((s) => s.key === 'tx_fee_credit')?.value ?? 5),
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
            hint="TRADE: cả hai bên. GIFT: người nhận."
          />
          <Field
            type="number"
            label="Hạn mức top-up/ngày"
            value={200000}
            readOnly
            hint="Giá trị demo bằng VND."
          />
        </div>
        <div className="mt-5 rounded-md bg-primary-faint p-4 text-sm text-text-secondary">
          1 Credit = 1.000 VND. Việc đổi cấu hình không tác động ngược lên giao dịch đã tạo.
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
  const data = useAppSelector(selectData);
  const configs = {
    expired: ['Bài quá hạn', 'Theo dõi và xử lý các bài đã hết thời gian hiển thị.'],
    categories: ['Danh mục', 'Quản lý cấu trúc danh mục dùng chung toàn hệ thống.'],
    keywords: ['Từ khóa cấm', 'Các cụm từ được dùng khi kiểm tra nội dung bài đăng.'],
    districts: ['Khu vực', 'Danh sách quận được hỗ trợ trong tìm kiếm và giao nhận.'],
    reputation: ['Uy tín & hạng', 'Theo dõi điểm, hạng và mức độ tin cậy của thành viên.'],
    locked: ['Tài khoản bị khóa', 'Các tài khoản bị hạn chế truy cập hệ thống.'],
    disputes: ['Tranh chấp', 'Hồ sơ giao dịch cần quản trị viên xem xét.'],
    alerts: ['Cảnh báo bất thường', 'Tín hiệu cần kiểm tra từ hoạt động giao dịch và Credit.'],
    ranks: ['Mốc hạng', 'Cấu hình các mốc Reward Points cho hạng thành viên.'],
  } as const;
  const [title, description] = configs[kind];
  let content: ReactNode;
  if (kind === 'categories')
    content = (
      <SimpleRows
        rows={CATEGORIES.map((name, i) => [
          name,
          `${data.items.filter((x) => x.category === name).length} bài`,
          i % 3 === 0 ? 'Đang nổi bật' : 'Đang dùng',
        ])}
      />
    );
  else if (kind === 'districts')
    content = (
      <SimpleRows
        rows={DISTRICTS.map((name) => [
          name,
          `${data.items.filter((x) => x.district === name).length} món`,
          'Đang hỗ trợ',
        ])}
      />
    );
  else if (kind === 'keywords')
    content = (
      <SimpleRows
        rows={['hàng cấm', 'vũ khí', 'thuốc kê đơn', 'thông tin liên hệ'].map((name, i) => [
          name,
          `${[3, 1, 2, 7][i]} lần phát hiện`,
          'Tự động gắn cờ',
        ])}
      />
    );
  else if (kind === 'reputation')
    content = (
      <SimpleRows
        rows={data.users
          .filter((u) => u.role !== 'admin')
          .map((u) => [
            u.name,
            `${u.rewardPoints} Reward Points`,
            `${u.reputationStars} sao · ${u.rank}`,
          ])}
      />
    );
  else if (kind === 'locked')
    content = (
      <SimpleRows
        rows={data.users
          .filter((u) => u.status === 'locked')
          .map((u) => [u.name, u.email, 'Đã khóa'])}
        empty="Không có tài khoản nào đang bị khóa."
      />
    );
  else if (kind === 'expired')
    content = (
      <SimpleRows
        rows={data.items
          .filter((i) => i.status === 'expired')
          .map((i) => [i.title, i.district, new Date(i.expiresAt).toLocaleDateString('vi-VN')])}
        empty="Hiện không có bài quá hạn."
      />
    );
  else if (kind === 'disputes')
    content = (
      <SimpleRows
        rows={data.disputes.map((d) => [d.id, d.reason, d.status])}
        empty="Không có tranh chấp đang mở."
      />
    );
  else if (kind === 'alerts')
    content = (
      <SimpleRows
        rows={data.transactions
          .filter((t) => t.status === 'DISPUTED' || t.creditHeldBy.length > 1)
          .map((t) => [
            t.id,
            t.status === 'DISPUTED' ? 'Giao dịch có tranh chấp' : 'Nhiều bên đã giữ Credit',
            t.status,
          ])}
      />
    );
  else
    content = (
      <SimpleRows
        rows={[
          [0, 'Thành viên mới', '0-99 điểm'],
          [100, 'Đồng hành', '100-299 điểm'],
          [300, 'Tin cậy', '300-699 điểm'],
          [700, 'Đại sứ', '700+ điểm'],
        ].map((r) => [String(r[1]), String(r[2]), `Mốc ${r[0]}`])}
      />
    );
  return (
    <Panel title={title} description={description}>
      {content}
    </Panel>
  );
}
function SimpleRows({
  rows,
  empty = 'Chưa có dữ liệu phù hợp.',
}: {
  rows: string[][];
  empty?: string;
}) {
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
    <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-sm text-text-muted">
      {empty}
    </div>
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
