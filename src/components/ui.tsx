import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import * as Icons from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { Item, ItemCondition, ItemType, TransactionStatus, User } from '../types/domain';
import { conditionLabel, txLabel } from '../utils/formatting';

const iconMap = {
  search: Icons.MagnifyingGlass,
  add: Icons.Plus,
  wallet: Icons.Wallet,
  location: Icons.MapPin,
  star: Icons.Star,
  box: Icons.Package,
  calendar: Icons.CalendarBlank,
  send: Icons.PaperPlaneTilt,
  menu: Icons.List,
  close: Icons.X,
  chevronDown: Icons.CaretDown,
  home: Icons.House,
  browse: Icons.MagnifyingGlass,
  activity: Icons.ArrowsClockwise,
  ai: Icons.Sparkle,
  messages: Icons.ChatCircleDots,
  admin: Icons.SquaresFour,
  logout: Icons.SignOut,
  user: Icons.UserCircle,
  edit: Icons.PencilSimple,
  trash: Icons.Trash,
  renew: Icons.ArrowClockwise,
  image: Icons.Image,
  video: Icons.VideoCamera,
  check: Icons.Check,
  shield: Icons.ShieldCheck,
  filter: Icons.Funnel,
  arrow: Icons.ArrowRight,
  dashboard: Icons.SquaresFour,
  article: Icons.Files,
  group: Icons.Users,
  transaction: Icons.ArrowsLeftRight,
  payments: Icons.Coins,
  settings: Icons.GearSix,
  history: Icons.ClockCounterClockwise,
} as const;

export function Icon({
  name,
  className = '',
  weight = 'regular',
}: {
  name: keyof typeof iconMap | string;
  className?: string;
  weight?: Icons.IconWeight;
}) {
  const Glyph = iconMap[name as keyof typeof iconMap] ?? Icons.Circle;
  return <Glyph aria-hidden className={className} weight={weight} />;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof iconMap;
};
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover',
    secondary:
      'border-secondary bg-secondary text-white hover:border-secondary-hover hover:bg-secondary-hover',
    outline:
      'border-border bg-white text-text-secondary hover:border-primary/50 hover:bg-primary-faint hover:text-primary',
    ghost:
      'border-transparent bg-transparent text-text-secondary hover:bg-surface-low hover:text-text-primary',
    danger: 'border-error/20 bg-red-50 text-error hover:bg-red-100',
  };
  const sizes = {
    sm: 'min-h-9 px-3 py-1.5 text-xs rounded-md',
    md: 'min-h-11 px-4 py-2 text-sm rounded-md',
    lg: 'min-h-12 px-5 py-3 text-sm rounded-md',
  };
  return (
    <button
      className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border font-semibold transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon ? <Icon name={icon} className="size-[18px]" weight="bold" /> : null}
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: keyof typeof iconMap; label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-white text-text-secondary transition hover:border-primary/50 hover:bg-primary-faint hover:text-primary active:translate-y-px ${className}`}
      {...props}
    >
      <Icon name={icon} className="size-5" />
    </button>
  );
}

export function Field(
  props: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string },
) {
  const { label, error, hint, className = '', ...rest } = props;
  return (
    <label className="block min-w-0">
      {label ? <span className="label">{label}</span> : null}
      <input
        className={`input ${error ? 'border-error focus:border-error focus:ring-error/10' : ''} ${className}`}
        {...rest}
      />
      {error ? (
        <span className="mt-1.5 block text-xs text-error">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
export function TextArea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string },
) {
  const { label, error, className = '', ...rest } = props;
  return (
    <label className="block">
      {label ? <span className="label">{label}</span> : null}
      <textarea
        className={`input min-h-28 resize-y ${error ? 'border-error' : ''} ${className}`}
        {...rest}
      />
      {error ? <span className="mt-1.5 block text-xs text-error">{error}</span> : null}
    </label>
  );
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const { label, className = '', children, ...rest } = props;
  return (
    <label className="block">
      {label ? <span className="label">{label}</span> : null}
      <select className={`input ${className}`} {...rest}>
        {children}
      </select>
    </label>
  );
}
export function SearchField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex min-h-11 items-center rounded-md border border-border bg-white px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
      <Icon name="search" className="size-5 text-text-muted" />
      <input
        className="w-full border-0 bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-text-muted/70"
        {...props}
      />
    </div>
  );
}

export function TypeBadge({ type }: { type: ItemType }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-1 text-[11px] font-bold ${type === 'gift' ? 'bg-primary-soft text-primary' : 'bg-secondary-soft text-secondary'}`}
    >
      {type === 'gift' ? 'Cho tặng' : 'Trao đổi'}
    </span>
  );
}
export function ConditionBadge({ condition }: { condition: ItemCondition }) {
  return (
    <span className="inline-flex rounded-sm bg-surface-low px-2 py-1 text-[11px] font-medium text-text-secondary">
      {conditionLabel[condition]}
    </span>
  );
}
export function StatusBadge({
  status,
}: {
  status: TransactionStatus | Item['status'] | User['status'];
}) {
  const label =
    status in txLabel
      ? txLabel[status as TransactionStatus]
      : status === 'approved'
        ? 'Đã duyệt'
        : status === 'pending'
          ? 'Chờ duyệt'
          : status === 'rejected'
            ? 'Từ chối'
            : status === 'expired'
              ? 'Hết hạn'
              : status === 'removed'
                ? 'Đã gỡ'
                : status === 'locked'
                  ? 'Đã khóa'
                  : status === 'suspended'
                    ? 'Tạm khóa'
                    : 'Hoạt động';
  const danger = ['rejected', 'removed', 'locked', 'DISPUTED', 'CANCELLED'].includes(status);
  const ok = ['approved', 'active', 'COMPLETED'].includes(status);
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-sm px-2 py-1 text-[11px] font-semibold ${danger ? 'bg-red-50 text-error' : ok ? 'bg-emerald-50 text-success' : 'bg-amber-50 text-warning'}`}
    >
      {label}
    </span>
  );
}
export function RankBadge({ rank }: { rank: string }) {
  return (
    <span className="inline-flex rounded-sm bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
      {rank}
    </span>
  );
}

export function EmptyState({
  icon = 'box',
  title,
  text,
  action,
}: {
  icon?: keyof typeof iconMap;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-surface-low text-text-muted">
        <Icon name={icon} className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
export function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg bg-white ring-1 ring-border/70"
        >
          <div className="aspect-[4/3] bg-surface-container" />
          <div className="space-y-3 p-4">
            <div className="h-4 rounded bg-surface-container" />
            <div className="h-3 w-2/3 rounded bg-surface-low" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function Alert({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}) {
  const cls = {
    info: 'border-blue-100 bg-blue-50 text-info',
    success: 'border-emerald-100 bg-emerald-50 text-success',
    warning: 'border-amber-100 bg-amber-50 text-warning',
    error: 'border-red-100 bg-red-50 text-error',
  };
  return (
    <div className={`rounded-md border px-4 py-3 text-sm leading-6 ${cls[tone]}`}>{children}</div>
  );
}

export function ProductCard({ item, owner }: { item: Item; owner?: User }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="group block min-w-0 overflow-hidden rounded-lg bg-white ring-1 ring-border/80 transition duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-primary/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
        <img
          src={item.images[0]}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <TypeBadge type={item.type} />
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-text-primary sm:min-h-11 sm:text-[15px] sm:leading-[1.45]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">
          {item.description}
        </p>
        <div className="mt-3 flex min-w-0 items-center gap-2">
          <ConditionBadge condition={item.condition} />
          <span className="min-w-0 truncate text-xs text-text-muted">{item.category}</span>
        </div>
        {owner ? (
          <div className="mt-3 flex min-w-0 items-center gap-2 text-xs font-semibold text-text-secondary">
            <Avatar user={owner} size="sm" />
            <span className="min-w-0 truncate">{owner.name}</span>
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-text-muted">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
            <Icon name="location" className="size-4 shrink-0" />
            {item.district}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Icon name="star" className="size-4 text-warning" weight="fill" />
            {owner?.reputationStars ?? 5}
          </span>
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary transition group-hover:text-primary-hover">
          Xem chi tiết
          <Icon name="arrow" className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
export function HorizontalProductCard({ item, owner }: { item: Item; owner?: User }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="group flex min-w-0 gap-3 rounded-md p-2 transition hover:bg-primary-faint"
    >
      <img
        src={item.images[0]}
        alt={item.title}
        className="h-20 w-24 shrink-0 rounded-md object-cover"
      />
      <div className="min-w-0 flex-1 py-1">
        <h3 className="truncate text-sm font-bold group-hover:text-primary">{item.title}</h3>
        <p className="mt-1 truncate text-xs text-text-muted">
          {item.district} · {owner?.name}
        </p>
        <div className="mt-2 flex gap-2">
          <TypeBadge type={item.type} />
          <ConditionBadge condition={item.condition} />
        </div>
      </div>
    </Link>
  );
}
export function OwnerCard({ owner }: { owner: User }) {
  return (
    <div className="rounded-lg bg-white p-5 ring-1 ring-border/80">
      <div className="flex items-center gap-3">
        <Avatar user={owner} size="lg" />
        <div className="min-w-0">
          <div className="truncate font-bold">{owner.name}</div>
          <div className="mt-0.5 text-xs text-text-muted">
            {owner.district} · {owner.totalTx} giao dịch
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <RankBadge rank={owner.rank} />
        <span className="inline-flex items-center gap-1 text-sm font-bold text-warning">
          <Icon name="star" className="size-4" weight="fill" />
          {owner.reputationStars}
        </span>
      </div>
    </div>
  );
}
export function Avatar({
  user,
  size = 'md',
}: {
  user: Pick<User, 'name' | 'avatarInitials' | 'avatarUrl'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cls = { sm: 'size-8 text-[11px]', md: 'size-10 text-xs', lg: 'size-14 text-base' };
  return user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={`Ảnh đại diện của ${user.name}`}
      className={`shrink-0 rounded-md object-cover ${cls[size]}`}
    />
  ) : (
    <span
      aria-label={user.name}
      className={`inline-flex shrink-0 items-center justify-center rounded-md bg-primary text-white font-bold ${cls[size]}`}
    >
      {user.avatarInitials}
    </span>
  );
}
export function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="min-w-0 border-l-2 border-primary/20 pl-4">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <div className="mt-1 truncate text-2xl font-bold tabular-nums text-text-primary">{value}</div>
      {detail ? <p className="mt-1 text-xs text-text-muted">{detail}</p> : null}
    </div>
  );
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-intro">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
