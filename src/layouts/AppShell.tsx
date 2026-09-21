import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { actions, selectCurrentUser } from '../app/store';
import { Avatar, Button, Icon, IconButton } from '../components/ui';

export function AppShell() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const nav = user
    ? [
        ['/', 'Trang chủ', 'home'],
        ['/browse', 'Tìm đồ', 'browse'],
        ['/activities', 'Hoạt động', 'activity'],
        ['/ai', 'Trợ lý AI', 'ai'],
        ['/messages', 'Tin nhắn', 'messages'],
      ]
    : [
        ['/', 'Trang chủ', 'home'],
        ['/browse', 'Tìm đồ', 'browse'],
        ['/ai', 'Trợ lý AI', 'ai'],
      ];
  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white focus:translate-y-0"
      >
        Bỏ qua điều hướng
      </a>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-5 px-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={closeMenus} className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-white">
              <Icon name="renew" className="size-5" weight="bold" />
            </span>
            <span className="text-base font-extrabold text-text-primary">
              SHARE<span className="text-primary">LOOP</span>
            </span>
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex">
            {nav.map(([to, label]) => (
              <NavLink
                end={to === '/'}
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary-faint text-primary' : 'text-text-secondary hover:bg-surface-low hover:text-text-primary'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/credit"
                  className="hidden items-center gap-2 rounded-md border border-border bg-white px-2.5 py-2 text-xs font-semibold text-text-secondary transition hover:border-primary/30 hover:bg-primary-faint hover:text-primary sm:flex"
                >
                  <Icon name="wallet" className="size-[18px]" />
                  {user.availableCredit} Credit
                </Link>
                <Link to="/post" className="hidden sm:block">
                  <Button icon="add" size="sm">
                    Đăng đồ
                  </Button>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1 rounded-md p-1 transition hover:bg-surface-low"
                    aria-expanded={profileOpen}
                  >
                    <Avatar user={user} />
                    <Icon name="chevronDown" className="hidden size-4 text-text-muted sm:block" />
                  </button>
                  {profileOpen ? (
                    <div className="absolute right-0 top-12 w-60 rounded-lg bg-white p-2 shadow-lg ring-1 ring-border">
                      <div className="border-b border-border/70 px-3 py-2.5">
                        <p className="truncate text-sm font-bold">{user.name}</p>
                        <p className="mt-0.5 truncate text-xs text-text-muted">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-low"
                      >
                        <Icon name="user" className="size-5" />
                        Hồ sơ
                      </Link>
                      <Link
                        to="/credit"
                        onClick={closeMenus}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-low"
                      >
                        <Icon name="wallet" className="size-5" />
                        Credit
                      </Link>
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={closeMenus}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-low"
                        >
                          <Icon name="admin" className="size-5" />
                          Quản trị
                        </Link>
                      ) : null}
                      <button
                        onClick={() => {
                          dispatch(actions.logout());
                          closeMenus();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-error hover:bg-red-50"
                      >
                        <Icon name="logout" className="size-5" />
                        Đăng xuất
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm font-semibold text-text-secondary hover:text-primary sm:block"
                >
                  Đăng nhập
                </Link>
                <Link to="/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
            <IconButton
              icon={mobileOpen ? 'close' : 'menu'}
              label="Mở điều hướng"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            />
          </div>
        </div>
        {mobileOpen ? (
          <nav className="border-t border-border bg-white px-4 py-3 lg:hidden">
            {nav.map(([to, label, icon]) => (
              <NavLink
                end={to === '/'}
                key={to}
                to={to}
                onClick={closeMenus}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${isActive ? 'bg-primary-faint text-primary' : 'text-text-secondary'}`
                }
              >
                <Icon name={icon} className="size-5" />
                {label}
              </NavLink>
            ))}
            {user ? (
              <Link
                to="/post"
                onClick={closeMenus}
                className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white"
              >
                <Icon name="add" className="size-5" />
                Đăng đồ
              </Link>
            ) : null}
          </nav>
        ) : null}
      </header>
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-border bg-white">
        <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="max-w-sm">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-md bg-primary text-white">
                  <Icon name="renew" className="size-5" weight="bold" />
                </span>
                <strong className="text-base font-extrabold text-text-primary">
                  SHARE<span className="text-primary">LOOP</span>
                </strong>
              </Link>
              <p className="mt-4 text-sm leading-6 text-text-muted">
                Trao món đồ cũ, mở một vòng đời mới cho cộng đồng.
              </p>
            </div>
            <FooterGroup
              title="Khám phá"
              links={[
                ['Tìm đồ', '/browse'],
                ['Trợ lý AI', '/ai'],
                ['Đăng đồ', '/post'],
              ]}
            />
            <FooterGroup
              title="Tài khoản"
              links={[
                ['Hồ sơ', '/profile'],
                ['Credit', '/credit'],
                ['Hoạt động', '/activities'],
              ]}
            />
            <div>
              <h2 className="text-sm font-bold text-text-primary">Hỗ trợ</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-text-muted">
                <p>Quy tắc cộng đồng</p>
                <p>Chính sách an toàn</p>
                <p>Hướng dẫn trao đổi</p>
                <a href="mailto:support@shareloop.vn" className="block hover:text-primary">
                  support@shareloop.vn
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 SHARELOOP</p>
          
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterGroup({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-text-primary">{title}</h2>
      <nav className="mt-4 space-y-3">
        {links.map(([label, to]) => (
          <Link
            key={to}
            to={to}
            className="block text-sm leading-6 text-text-muted transition hover:text-primary"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
