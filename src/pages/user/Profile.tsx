import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Avatar,
  Button,
  Field,
  Icon,
  PageHeader,
  RankBadge,
  Select,
  Stat,
} from '../../components/ui';
import { formatCredit, formatVnd } from '../../utils/formatting';
import { fileToDataUrl } from '../../utils/files';
export function Profile() {
  const user = useAppSelector(selectCurrentUser)!;
  const data = useAppSelector(selectData);
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'profile' | 'credit' | 'reputation'>('profile');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [district, setDistrict] = useState(user.district);
  const [amount, setAmount] = useState(50000);
  const [showQr, setShowQr] = useState(false);
  const history = data.creditHistory.filter((h) => h.userId === user.id);
  const topups = data.topups.filter((t) => t.userId === user.id);
  const districts = data.districts
    .filter((entry) => entry.status === 'active')
    .map((entry) => entry.name);
  const save = () =>
    dispatch(actions.updateProfile({ userId: user.id, name, email, phone, district, avatarUrl }));
  return (
    <div className="page-shell">
      <PageHeader
        title="Tài khoản của bạn"
        description="Quản lý thông tin, Credit và uy tín cộng đồng."
      />
      <div className="grid gap-7 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="flex items-center gap-3 pb-5">
            <Avatar user={{ ...user, avatarUrl }} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate font-bold">{user.name}</h2>
              <div className="mt-1">
                <RankBadge rank={user.rank} />
              </div>
            </div>
          </div>
          <nav className="space-y-1 border-t border-border pt-4">
            {(
              [
                ['profile', 'Hồ sơ', 'user'],
                ['credit', 'Credit', 'wallet'],
                ['reputation', 'Uy tín & Hạng', 'star'],
              ] as const
            ).map(([id, label, icon]) =>
              id === 'credit' ? (
                <Link
                  key={id}
                  to="/credit"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-text-secondary hover:bg-surface-low"
                >
                  <Icon name={icon} className="size-5" />
                  {label}
                </Link>
              ) : (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold ${tab === id ? 'bg-primary-faint text-primary' : 'text-text-secondary hover:bg-surface-low'}`}
                >
                  <Icon name={icon} className="size-5" />
                  {label}
                </button>
              ),
            )}
          </nav>
        </aside>
        <main className="min-w-0">
          {tab === 'profile' ? (
            <section className="rounded-xl bg-white p-5 ring-1 ring-border/80 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title">Thông tin cá nhân</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Thông tin dùng để liên hệ trong giao dịch.
                  </p>
                </div>
                <label
                  className="grid size-11 cursor-pointer place-items-center rounded-md bg-primary-soft text-primary"
                  title="Đổi ảnh đại diện"
                >
                  <Icon name="image" className="size-5" />
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (file) setAvatarUrl(await fileToDataUrl(file));
                    }}
                  />
                </label>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} />
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Field
                  label="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Select label="Quận" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </div>
              <Button className="mt-6" onClick={save}>
                Lưu thay đổi
              </Button>
            </section>
          ) : null}
          {tab === 'credit' ? (
            <div className="space-y-6">
              <section className="rounded-xl bg-white p-5 ring-1 ring-border/80 sm:p-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  <Stat label="Tổng Credit" value={formatCredit(user.totalCredit)} />
                  <Stat
                    label="Khả dụng"
                    value={formatCredit(user.availableCredit)}
                    detail="Có thể dùng cho giao dịch"
                  />
                  <Stat
                    label="Đang giữ"
                    value={formatCredit(user.holdCredit)}
                    detail="Chưa được chi tiêu"
                  />
                </div>
                <div className="mt-6 border-t border-border pt-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="section-title">Nạp Credit</h2>
                      <p className="mt-1 text-xs text-text-muted">1 VND = 1 Credit</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {[10000, 20000, 50000, 100000, 200000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmount(v)}
                        className={`rounded-md border px-2 py-2.5 text-xs font-semibold ${amount === v ? 'border-primary bg-primary-faint text-primary' : 'border-border text-text-secondary hover:border-primary/40'}`}
                      >
                        {formatVnd(v)}
                      </button>
                    ))}
                  </div>
                  <Button className="mt-4" onClick={() => setShowQr(true)}>
                    Tạo mã QR
                  </Button>
                  {showQr ? (
                    <div className="mt-5 grid gap-5 rounded-lg bg-background p-5 sm:grid-cols-[150px_1fr] sm:items-center">
                      <div className="mx-auto grid aspect-square w-[150px] grid-cols-7 gap-1 bg-white p-3 ring-1 ring-border">
                        {Array.from({ length: 49 }, (_, i) => (
                          <span
                            key={i}
                            className={`${(i * 7 + i * 3) % 5 < 2 ? 'bg-text-primary' : 'bg-white'}`}
                          />
                        ))}
                      </div>
                      <div>
                        <h3 className="font-bold">Chuyển khoản {formatVnd(amount)}</h3>
                        <p className="mt-2 text-sm leading-6 text-text-muted">
                          Nội dung:{' '}
                          <strong className="text-text-primary">SHARELOOP {user.id}</strong>
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          Sau khi xác nhận, yêu cầu sẽ ở trạng thái chờ quản trị viên duyệt.
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => {
                            dispatch(actions.topupCredit({ userId: user.id, vnd: amount }));
                            setShowQr(false);
                          }}
                        >
                          Tôi đã chuyển khoản
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
              <section className="rounded-xl bg-white ring-1 ring-border/80">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="section-title">Lịch sử Credit</h2>
                </div>
                {[
                  ...topups.map((t) => ({
                    id: t.id,
                    note: `Nạp ${t.amount} Credit`,
                    amount: t.status === 'completed' ? t.amount : 0,
                    date: t.createdAt,
                    status: t.status,
                  })),
                  ...history.map((h) => ({
                    id: h.id,
                    note: h.note,
                    amount: h.amount,
                    date: h.createdAt,
                    status: 'record',
                  })),
                ].map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1fr_auto] gap-4 border-b border-border/70 px-5 py-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{row.note}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {new Date(row.date).toLocaleDateString('vi-VN')} ·{' '}
                        {row.status === 'pending' ? 'Chờ xác nhận' : 'Đã ghi nhận'}
                      </p>
                    </div>
                    <strong
                      className={`text-sm tabular-nums ${row.amount < 0 ? 'text-error' : row.amount > 0 ? 'text-success' : 'text-warning'}`}
                    >
                      {row.amount > 0 ? '+' : ''}
                      {row.amount || 'Đang chờ'}
                    </strong>
                  </div>
                ))}
              </section>
            </div>
          ) : null}
          {tab === 'reputation' ? (
            <div className="space-y-6">
              <section className="grid gap-5 rounded-xl bg-white p-6 ring-1 ring-border/80 sm:grid-cols-3">
                <Stat label="Reward Points" value={user.rewardPoints} detail="Điểm hoạt động" />
                <Stat label="Hạng thành viên" value={user.rank} detail="Dựa trên điểm và lịch sử" />
                <Stat
                  label="Reputation Stars"
                  value={user.reputationStars.toFixed(1)}
                  detail="Đánh giá từ cộng đồng"
                />
              </section>
              <section className="rounded-xl bg-white p-6 ring-1 ring-border/80">
                <h2 className="section-title">Lịch sử uy tín</h2>
                <div className="mt-4 space-y-3">
                  {[
                    'Hoàn tất giao dịch đúng lịch',
                    'Phản hồi tích cực từ thành viên',
                    'Xác nhận bàn giao đầy đủ',
                  ].map((text, i) => (
                    <div
                      key={text}
                      className="flex items-center justify-between rounded-md bg-background p-3 text-sm"
                    >
                      <span>{text}</span>
                      <span className="font-semibold text-success">+{[5, 3, 2][i]} điểm</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
