import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../../components/ui';
const sections = [
  { label: 'Tổng quan', items: [['dashboard', 'Tổng quan', '/admin']] },
  {
    label: 'Nội dung',
    items: [
      ['article', 'Duyệt bài', '/admin/moderation'],
      ['history', 'Bài quá hạn', '/admin/expired-posts'],
      ['box', 'Danh mục', '/admin/categories'],
      ['shield', 'Từ khóa cấm', '/admin/keywords'],
      ['location', 'Khu vực', '/admin/districts'],
    ],
  },
  {
    label: 'Người dùng',
    items: [
      ['group', 'Danh sách người dùng', '/admin/users'],
      ['star', 'Uy tín & Hạng', '/admin/reputation'],
      ['close', 'Khóa tài khoản', '/admin/locked-users'],
    ],
  },
  {
    label: 'Giao dịch',
    items: [
      ['transaction', 'Giao dịch', '/admin/transactions'],
      ['shield', 'Khiếu nại', '/admin/complaints'],
      ['activity', 'Cảnh báo bất thường', '/admin/alerts'],
    ],
  },
  {
    label: 'Tài chính',
    items: [
      ['payments', 'Báo cáo tài chính', '/admin/finance'],
      ['search', 'Tra cứu người dùng', '/admin/finance/users'],
    ],
  },
  {
    label: 'Cấu hình',
    items: [
      ['settings', 'Phí & hạn mức', '/admin/settings/fees'],
      ['star', 'Mốc hạng', '/admin/settings/ranks'],
    ],
  },
  { label: 'Hệ thống', items: [['history', 'Audit Log', '/admin/audit-logs']] },
] as const;
export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const nav = (
    <>
      {sections.map((section) => (
        <div key={section.label} className="mb-5">
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {section.label}
          </p>
          {section.items.map(([icon, label, to]) => (
            <NavLink
              end={to === '/admin'}
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-low hover:text-text-primary'}`
              }
            >
              <Icon name={icon} className="size-[18px]" />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </>
  );
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[230px_1fr] lg:gap-8 lg:px-8">
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <div>
          <p className="text-xs font-semibold text-primary">SHARELOOP OPERATIONS</p>
          <h1 className="text-xl font-bold">Quản trị</h1>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="grid size-10 place-items-center rounded-md border border-border bg-white"
        >
          <Icon name={open ? 'close' : 'menu'} className="size-5" />
        </button>
      </div>
      <aside
        className={`${open ? 'block' : 'hidden'} h-fit rounded-lg bg-white p-2 ring-1 ring-border/80 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto`}
      >
        <div className="hidden border-b border-border px-3 pb-4 pt-2 lg:block">
          <p className="text-[10px] font-bold tracking-wider text-primary">SHARELOOP</p>
          <p className="mt-1 text-sm font-bold">Operations Console</p>
        </div>
        <nav className="pt-3">{nav}</nav>
      </aside>
      <main className="min-w-0 pt-2 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
