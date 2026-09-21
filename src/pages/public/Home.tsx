import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser, selectData } from '../../app/store';
import {
  Avatar,
  Button,
  ConditionBadge,
  Icon,
  ProductCard,
  SearchField,
  TypeBadge,
} from '../../components/ui';
import { CATEGORIES } from '../../constants/domain';
import type { Item, User } from '../../types/domain';

const categoryIcons = ['ai', 'home', 'article', 'user', 'box', 'activity', 'star', 'edit'];
const popularDistricts = ['Bình Thạnh', 'Phú Nhuận', 'Quận 3', 'Quận 7', 'Tân Bình', 'TP Thủ Đức'];
const quickLinks = [
  { label: 'Đồ cho tặng', to: '/browse?type=gift' },
  { label: 'Đồ điện tử', to: '/browse?category=Đồ%20điện%20tử' },
  { label: 'Sách', to: '/browse?category=Sách' },
  { label: 'Bình Thạnh', to: '/browse?district=Bình%20Thạnh' },
];
const featuredIds = [
  'item_005',
  'item_001',
  'item_011',
  'item_006',
  'item_017',
  'item_018',
  'item_020',
  'item_022',
];

function SectionHeading({
  title,
  description,
  href,
  linkLabel = 'Xem tất cả',
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
      <div className="min-w-0">
        <h2 className="text-xl font-bold leading-tight text-text-primary sm:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-muted">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          to={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          {linkLabel}
          <Icon name="arrow" className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

function HomeSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

function GiftRailCard({ item, owner }: { item: Item; owner?: User }) {
  return (
    <Link to={`/items/${item.id}`} className="group w-[238px] shrink-0 sm:w-[272px] lg:w-auto">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-container">
        <img
          src={item.images[0]}
          alt={item.title}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3">
          <TypeBadge type={item.type} />
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-text-primary transition group-hover:text-primary">
        {item.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-muted">{item.description}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
        <Icon name="location" className="size-3.5" />
        {item.district}
      </p>
      {owner ? (
        <p className="mt-2 flex min-w-0 items-center gap-2 text-xs font-semibold text-text-secondary">
          <Avatar user={owner} size="sm" />
          <span className="min-w-0 truncate">{owner.name}</span>
        </p>
      ) : null}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary transition group-hover:text-primary-hover">
        Xem chi tiết
        <Icon name="arrow" className="size-3.5" />
      </span>
    </Link>
  );
}

function TradeCard({ item, owner }: { item: Item; owner?: User }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="group grid min-w-0 grid-cols-[104px_1fr] gap-4 rounded-lg bg-white p-3 ring-1 ring-border/80 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20 sm:grid-cols-[132px_1fr]"
    >
      <img
        src={item.images[0]}
        alt={item.title}
        className="aspect-square size-full rounded-md object-cover"
      />
      <div className="min-w-0 py-1">
        <div className="flex items-center gap-2">
          <TypeBadge type={item.type} />
          <ConditionBadge condition={item.condition} />
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 transition group-hover:text-primary sm:text-base">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-muted">{item.description}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">
          <span className="font-semibold text-text-secondary">Đang tìm:</span> {item.tradeFor}
        </p>
        {owner ? (
          <p className="mt-2 flex min-w-0 items-center gap-2 text-xs font-semibold text-text-secondary">
            <Avatar user={owner} size="sm" />
            <span className="min-w-0 truncate">{owner.name}</span>
          </p>
        ) : null}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary transition group-hover:text-primary-hover">
          Xem chi tiết
          <Icon name="arrow" className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

export function Home() {
  const { items, users } = useAppSelector(selectData);
  const districtOptions = useAppSelector(selectData).districts
    .filter((entry) => entry.status === 'active')
    .map((entry) => entry.name);
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('Bình Thạnh');

  const approved = useMemo(
    () =>
      items
        .filter((item) => item.status === 'approved')
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    [items],
  );
  const gifts = approved.filter((item) => item.type === 'gift');
  const trades = approved.filter((item) => item.type === 'trade');
  const featured = featuredIds
    .map((id) => approved.find((item) => item.id === id))
    .filter((item): item is Item => Boolean(item));
  const editorialItem = approved.find((item) => item.id === 'item_005') ?? trades[0];
  const districtCounts = popularDistricts.map((name) => ({
    name,
    count: approved.filter((item) => item.district === name).length,
  }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(q)}&district=${encodeURIComponent(district)}`);
  };

  return (
    <div className="pb-12 sm:pb-16">
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8 lg:py-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
              Cộng đồng cho tặng và trao đổi tại TP.HCM
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.12] text-text-primary sm:text-5xl lg:text-[52px]">
              Món đồ cũ.
              <br />
              <span className="text-primary">Một vòng đời mới.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">
              Tìm những món đồ còn tốt từ người trong cộng đồng, theo đúng quận bạn thuận tiện gặp
              gỡ.
            </p>

            <form
              onSubmit={submit}
              className="mt-6 grid gap-2 rounded-lg bg-background p-2 ring-1 ring-border sm:grid-cols-[1fr_176px_auto]"
            >
              <SearchField
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Bạn đang tìm món gì?"
                aria-label="Từ khóa tìm kiếm"
              />
              <select
                aria-label="Chọn quận"
                className="input"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
              >
                {districtOptions.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <Button icon="search">Tìm đồ</Button>
            </form>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:border-primary/30 hover:bg-primary-faint hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div
            className="grid h-[280px] grid-cols-2 grid-rows-2 gap-2.5 sm:h-[340px] lg:h-[420px] lg:grid-cols-[1.08fr_.92fr] lg:grid-rows-3"
            aria-label="Món đồ nổi bật"
          >
            {approved.slice(0, 4).map((item, index) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className={`group relative min-h-0 overflow-hidden rounded-lg bg-surface-container ${
                  index === 0 ? 'lg:row-span-3' : ''
                }`}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-3 pb-3 pt-10">
                  <span className="line-clamp-2 text-xs font-semibold leading-5 text-white sm:text-sm">
                    {item.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeSection className="pt-9 sm:pt-12">
        <SectionHeading
          title="Khám phá theo danh mục"
          description="Đi thẳng đến nhóm đồ bạn đang cần."
        />
        <div className="grid auto-cols-[132px] grid-flow-col gap-3 overflow-x-auto pb-2 sm:grid-flow-row sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category}
              to={`/browse?category=${encodeURIComponent(category)}`}
              className="group flex min-h-24 flex-col justify-between rounded-lg bg-white p-3 ring-1 ring-border/80 transition hover:-translate-y-0.5 hover:shadow-sm hover:ring-primary/25"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-primary-faint text-primary">
                <Icon name={categoryIcons[index]} className="size-5" weight="bold" />
              </span>
              <span className="mt-3 text-xs font-bold leading-5 text-text-secondary transition group-hover:text-primary">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection className="pt-12 sm:pt-16">
        <SectionHeading
          title="Được quan tâm trong cộng đồng"
          description="Những món đồ nổi bật đang sẵn sàng cho một kết nối mới."
          href="/browse"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featured.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              owner={users.find((user) => user.id === item.ownerId)}
            />
          ))}
        </div>
      </HomeSection>

      {editorialItem ? (
        <HomeSection className="pt-12 sm:pt-16">
          <Link
            to={`/items/${editorialItem.id}`}
            className="group grid overflow-hidden rounded-xl bg-[#183c34] text-white shadow-md md:grid-cols-[1.08fr_.92fr]"
          >
            <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px]">
              <img
                src={editorialItem.images[0]}
                alt={editorialItem.title}
                className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.025]"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-8 sm:px-9 md:px-10 lg:px-12">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#b9d9cf]">
                Một món đồ đáng chú ý
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                {editorialItem.title}
              </h2>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/75">
                {editorialItem.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="location" className="size-4" />
                  {editorialItem.district}
                </span>
                <span>{editorialItem.tradeFor}</span>
              </div>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">
                Xem món đồ
                <Icon name="arrow" className="size-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </HomeSection>
      ) : null}

      <div className="mt-12 border-y border-border bg-white py-10 sm:mt-16 sm:py-14">
        <HomeSection>
          <SectionHeading
            title="Đồ đang được cho tặng"
            description="Những món còn hữu ích, được gửi tiếp không kèm giá bán."
            href="/browse?type=gift"
            linkLabel="Xem đồ tặng"
          />
          <div className="flex gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
            {gifts.slice(0, 5).map((item) => (
              <GiftRailCard
                key={item.id}
                item={item}
                owner={users.find((user) => user.id === item.ownerId)}
              />
            ))}
          </div>
        </HomeSection>
      </div>

      <HomeSection className="pt-12 sm:pt-16">
        <SectionHeading
          title="Khám phá quanh quận của bạn"
          description="Chọn khu vực thuận tiện để hẹn giao nhận trực tiếp."
          href="/browse"
          linkLabel="Xem mọi khu vực"
        />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border ring-1 ring-border sm:grid-cols-3 lg:grid-cols-6">
          {districtCounts.map(({ name, count }) => (
            <Link
              key={name}
              to={`/browse?district=${encodeURIComponent(name)}`}
              className="group bg-white px-4 py-5 transition hover:bg-primary-faint"
            >
              <Icon name="location" className="size-5 text-primary" />
              <h3 className="mt-3 text-sm font-bold text-text-primary group-hover:text-primary">
                {name}
              </h3>
              <p className="mt-1 text-xs text-text-muted">{count} món đang có</p>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection className="pt-12 sm:pt-16">
        <SectionHeading
          title="Đang tìm người trao đổi"
          description="Xem món chủ sở hữu đang có và điều họ mong muốn nhận lại."
          href="/browse?type=trade"
          linkLabel="Xem đồ trao đổi"
        />
        <div className="grid gap-3 md:grid-cols-2">
          {trades.slice(0, 4).map((item) => (
            <TradeCard
              key={item.id}
              item={item}
              owner={users.find((user) => user.id === item.ownerId)}
            />
          ))}
        </div>
      </HomeSection>

      <HomeSection className="pt-12 sm:pt-16">
        <div className="grid overflow-hidden rounded-xl bg-primary-faint ring-1 ring-primary/10 md:grid-cols-[1fr_auto] md:items-center">
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
                <Icon name="ai" className="size-5" weight="fill" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">LoopAI</p>
                <h2 className="mt-1 text-xl font-bold text-text-primary sm:text-2xl">
                  Diễn tả món bạn cần theo cách tự nhiên
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
              Thử “Tìm xe đạp mini miễn phí ở Bình Thạnh” để nhận gợi ý từ các bài đăng hiện có.
            </p>
          </div>
          <div className="border-t border-primary/10 px-6 py-6 md:border-l md:border-t-0 md:px-8">
            <Link
              to="/ai"
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
            >
              <Icon name="ai" className="size-[18px]" />
              Mở trợ lý AI
            </Link>
          </div>
        </div>
      </HomeSection>

      <HomeSection className="pt-12 sm:pt-16">
        <SectionHeading
          title="Mới đăng"
          description="Các bài vừa được cộng đồng chia sẻ và đã qua duyệt."
          href="/browse"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {approved.slice(0, 8).map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              owner={users.find((user) => user.id === item.ownerId)}
            />
          ))}
        </div>
      </HomeSection>

      <HomeSection className="pt-12 sm:pt-16">
        <div className="border-y border-border py-9 sm:py-11">
          <SectionHeading
            title="Một vòng chia sẻ thật đơn giản"
            description="Mọi kết nối bắt đầu từ một món đồ còn giá trị."
          />
          <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              ['01', 'Đăng hoặc tìm món', 'Chia sẻ món bạn có, hoặc lọc theo nhu cầu và quận.'],
              [
                '02',
                'Trò chuyện và chốt lịch',
                'Thống nhất món trao đổi, thời gian và điểm giao nhận.',
              ],
              [
                '03',
                'Xác nhận hoàn tất',
                'Hai bên xác nhận bàn giao để khép lại giao dịch an toàn.',
              ],
            ].map(([number, title, text]) => (
              <li key={number} className="grid grid-cols-[40px_1fr] gap-3">
                <span className="text-sm font-extrabold text-primary">{number}</span>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </HomeSection>

      <HomeSection className="pt-12 sm:pt-16">
        <div className="grid gap-7 overflow-hidden rounded-xl bg-primary px-6 py-9 text-white shadow-md sm:px-9 sm:py-11 md:grid-cols-[1fr_auto] md:items-center lg:px-12">
          <div>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">Có món đồ vẫn còn tốt?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Đăng lên SHARELOOP để tặng lại hoặc tìm một món phù hợp để trao đổi.
            </p>
          </div>
          <Link
            to={currentUser ? '/post' : '/login'}
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start whitespace-nowrap rounded-md bg-white px-5 py-3 text-sm font-bold text-primary shadow-sm transition hover:bg-primary-soft md:self-center"
          >
            <Icon name="add" className="size-[18px]" weight="bold" />
            Đăng món đồ
          </Link>
        </div>
      </HomeSection>
    </div>
  );
}
