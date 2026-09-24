import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser, selectData } from '../../app/store';
import {
  Avatar,
  Button,
  ConditionBadge,
  Icon,
  SearchField,
  TypeBadge,
} from '../../components/ui';
import { CATEGORIES } from '../../constants/domain';
import type { Item, ItemType, User } from '../../types/domain';
import { HomeLifecycle, HomeProcess } from './HomeCommunity';
import { HomeDiscoveryRail, HomeMotion } from './HomeMotion';
import './home-content.css';
const categoryIcons = ['device', 'chair', 'book', 'shirt', 'package', 'star', 'ai', 'edit'];
const newItemFilters: Array<{ value: 'all' | ItemType; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'gift', label: 'Cho tặng' },
  { value: 'trade', label: 'Trao đổi' },
];
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
const heroSlideIds = [
  'item_009',
  'item_022',
  'item_021',
  'item_012',
  'item_001',
  'item_005',
  'item_007',
  'item_016',
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
    <div className="home-section-heading mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
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
    <section className={`w-full ${className}`}>
      <div className="home-inner">
        {children}
      </div>
    </section>
  );
}

function HomeProductCard({ item, owner, tradeFor }: { item: Item; owner?: User; tradeFor?: string }) {
  return (
    <Link to={`/items/${item.id}`} className="home-product-card group">
      <div className="home-product-card-image">
        <img
          src={item.images[0]}
          alt={item.title}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3">
          <TypeBadge type={item.type} />
        </span>
      </div>
      <div className="home-product-card-copy">
        <h3>{item.title}</h3>
        {tradeFor ? (
          <div className="home-trade-description">
            <p className="home-product-card-description" title={item.description}>{item.description}</p>
            <p className="home-trade-for" title={`Đang tìm: ${tradeFor}`}><span>Đang tìm:</span> {tradeFor}</p>
          </div>
        ) : (
          <p className="home-product-card-description">{item.description}</p>
        )}
        <div className="home-product-card-meta"><ConditionBadge condition={item.condition} /><span>{item.category}</span></div>
      {owner ? (
        <p className="home-product-card-owner">
          <Avatar user={owner} size="sm" />
          <span className="min-w-0 truncate">{owner.name}</span>
        </p>
      ) : null}
        <div className="home-product-card-footer"><span><Icon name="location" className="size-4" />{item.district}</span><span><Icon name="star" className="size-4 text-warning" weight="fill" />{owner?.reputationStars ?? 5}</span></div>
        <span className="home-product-card-link">Xem chi tiết <Icon name="arrow" className="size-3.5" /></span>
      </div>
    </Link>
  );
}

function HomeHeroCarousel({ items, children }: { items: Item[]; children: ReactNode }) {
  const slides = useMemo(
    () =>
      heroSlideIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is Item => Boolean(item)),
    [items],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const nextImage = new Image();
    nextImage.src = slides[(activeIndex + 1) % slides.length].images[0];
  }, [activeIndex, slides]);

  useEffect(() => {
    const strip = thumbnailStripRef.current;
    const activeThumbnail = thumbnailRefs.current[activeIndex];

    if (!strip || !activeThumbnail || strip.scrollWidth <= strip.clientWidth) {
      return;
    }

    const centeredPosition =
      activeThumbnail.offsetLeft - (strip.clientWidth - activeThumbnail.clientWidth) / 2;
    strip.scrollTo({ left: Math.max(0, centeredPosition), behavior: 'smooth' });
  }, [activeIndex]);

  if (slides.length === 0) {
    return (
      <section className="border-b border-primary-hover/30 bg-[#0d332c]">
        <div className="home-inner pb-8 pt-[100px] sm:pb-10 sm:pt-[108px] lg:pb-12 lg:pt-[116px]">
          {children}
        </div>
      </section>
    );
  }

  const activeItem = slides[activeIndex];

  return (
    <section className="relative isolate overflow-hidden border-b border-primary-hover/30 bg-[#0d332c]">
      <div className="absolute inset-[-28px] z-0 overflow-hidden" aria-hidden="true">
        {slides.map((item, index) => (
          <img
            key={`background-${item.id}`}
            src={item.images[0]}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-all duration-[900ms] ease-out ${
              index === activeIndex
                ? 'scale-[1.035] opacity-100 blur-[1px] brightness-[0.88] contrast-[0.92] saturate-[0.95]'
                : 'scale-[1.07] opacity-0 blur-[8px] brightness-[0.68] contrast-[0.9] saturate-[0.9]'
            }`}
          />
        ))}
      </div>
     <div
  className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(4,29,14,0.38)_0%,rgba(6,35,29,0.28)_40%,rgba(5,30,25,0.16)_70%,rgba(3,22,18,0.06)_100%)]"
  aria-hidden="true"
/>
      <div
        className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(20,92,78,0.03)_0%,rgba(5,28,24,0.08)_62%,rgba(3,22,18,0.5)_100%)]"
        aria-hidden="true"
      />

      <div className="home-inner relative z-10 pb-8 pt-[100px] sm:pb-10 sm:pt-[108px] lg:pb-12 lg:pt-[116px]">
        <div className="grid gap-8 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-10">
          <div className="min-w-0">{children}</div>

          <Link
            to={`/items/${activeItem.id}`}
            className="group relative block h-[300px] overflow-hidden rounded-xl bg-black/20 shadow-[0_24px_70px_rgba(0,0,0,0.32)] ring-1 ring-white/20 sm:h-[380px] lg:h-[430px]"
            aria-label={`Xem chi tiết ${activeItem.title}`}
          >
            {slides.map((item, index) => (
              <img
                key={`main-${item.id}`}
                src={item.images[0]}
                alt={index === activeIndex ? item.title : ''}
                className={`absolute inset-0 size-full object-cover transition-all duration-700 ease-out ${
                  index === activeIndex
                    ? 'scale-100 opacity-100'
                    : 'pointer-events-none scale-[1.025] opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/[0.85] via-black/35 to-transparent px-5 pb-5 pt-24 sm:px-6 sm:pb-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-soft">
                SHARELOOP
              </p>
              <h2 className="mt-2 line-clamp-2 text-xl font-extrabold leading-tight text-white sm:text-2xl">
                {activeItem.title}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/80 sm:text-sm">
                <Icon name="location" className="size-4" />
                {activeItem.district}
              </p>
            </div>
          </Link>
        </div>

        <div
          ref={thumbnailStripRef}
          className="mt-7 overflow-x-auto px-1 pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-8"
          aria-label="Chọn món đồ nổi bật"
        >
          <div className="mx-auto flex w-max min-w-full items-center justify-start gap-2.5 sm:justify-center sm:gap-3">
            {slides.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.id}
                  ref={(element) => {
                    thumbnailRefs.current[index] = element;
                  }}
                  type="button"
                  aria-label={`Hiển thị ảnh ${item.title}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={`h-14 w-[72px] shrink-0 overflow-hidden rounded-md border bg-white/10 p-0 shadow-md transition duration-500 ease-out focus-visible:outline-white sm:h-16 sm:w-[84px] ${
                    isActive
                      ? '-translate-y-1 scale-105 border-white opacity-100 ring-2 ring-primary-fixed/90 shadow-lg'
                      : 'scale-95 border-white/35 opacity-60 hover:scale-100 hover:border-white/70 hover:opacity-100'
                  }`}
                >
                  <img src={item.images[0]} alt="" className="size-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Home() {
  const { items, users } = useAppSelector(selectData);
  const districtOptions = useAppSelector(selectData)
    .districts.filter((entry) => entry.status === 'active')
    .map((entry) => entry.name);
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('Bình Thạnh');
  const [newItemFilter, setNewItemFilter] = useState<'all' | ItemType>('all');

  const approved = useMemo(
    () =>
      items
        .filter((item) => item.status === 'approved' || item.status === 'APPROVED')
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    [items],
  );
  const gifts = approved.filter((item) => item.type === 'gift');
  const trades = approved.filter((item) => item.type === 'trade');
  const newItems = (
    newItemFilter === 'all'
      ? approved
      : approved.filter((item) => item.type === newItemFilter)
  ).slice(0, 5);
  const featured = featuredIds
    .map((id) => approved.find((item) => item.id === id))
    .filter((item): item is Item => Boolean(item));
  const districtCounts = popularDistricts.map((name) => ({
    name,
    count: approved.filter((item) => item.district === name).length,
  }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(q)}&district=${encodeURIComponent(district)}`);
  };

  return (
    <div className="home-page pb-12 sm:pb-16">
      <HomeHeroCarousel items={approved}>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-fixed">
            Cộng đồng cho tặng và trao đổi tại TP.HCM
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.12] text-white sm:text-5xl lg:text-[52px]">
            Món đồ cũ.
            <br />
            <span className="text-[#a9d5c6]">Một vòng đời mới.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            Tìm những món đồ còn tốt từ người trong cộng đồng, theo đúng quận bạn thuận tiện gặp gỡ.
          </p>

          <form
            onSubmit={submit}
            className="mt-6 grid gap-2 rounded-lg bg-white/[0.12] p-2 shadow-lg ring-1 ring-white/20 backdrop-blur-md sm:grid-cols-[1fr_176px_auto]"
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
                className="shrink-0 rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition hover:border-white/60 hover:bg-white/15 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </HomeHeroCarousel>

      <HomeMotion>
        <HomeSection className="home-band home-categories-band">
          <SectionHeading title="Khám phá theo danh mục" description="Tìm nhanh những món đồ đang được chia sẻ trong cộng đồng." href="/browse" />
          <HomeDiscoveryRail label="Khám phá theo danh mục" variant="categories">
            {CATEGORIES.map((category, index) => {
              const categoryItems = approved.filter((item) => item.category === category);
              return (
                <Link key={category} to={`/browse?category=${encodeURIComponent(category)}`} className="home-category group">
                  <Icon name="arrow" className="home-category-arrow" />
                  <span className="home-category-icon">
                    <Icon name={categoryIcons[index]} />
                  </span>
                  <span className="home-category-label">{category}</span>
                  <span className="home-category-count">{categoryItems.length} món đồ</span>
                </Link>
              );
            })}
          </HomeDiscoveryRail>
        </HomeSection>

        <HomeSection className="home-band">
          <SectionHeading title="Món đồ mới trong cộng đồng" description="Những món đồ vừa được chia sẻ và đang chờ một vòng đời mới." href="/browse" />
          <div className="home-new-filters" role="tablist" aria-label="Lọc món đồ mới">
            {newItemFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={newItemFilter === filter.value}
                onClick={() => setNewItemFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="home-product-grid home-new-items-grid">
            {newItems.map((item) => (
              <HomeProductCard key={item.id} item={item} owner={users.find((user) => user.id === item.ownerId)} />
            ))}
          </div>
        </HomeSection>

        <HomeSection className="home-band">
          <SectionHeading title="Được quan tâm trong cộng đồng" description="Những món đồ nổi bật đang sẵn sàng cho một kết nối mới." href="/browse" />
          <div className="home-product-grid">
            {featured.slice(0, 5).map((item) => (
              <HomeProductCard key={item.id} item={item} owner={users.find((user) => user.id === item.ownerId)} />
            ))}
          </div>
        </HomeSection>

        <div className="home-gift-band">
          <HomeSection className="home-band">
            <SectionHeading title="Đồ đang được cho tặng" description="Những món còn hữu ích, được gửi tiếp không kèm giá bán." href="/browse?type=gift" linkLabel="Xem đồ tặng" />
            <div className="home-product-grid">
              {gifts.slice(0, 5).map((item) => (
                <HomeProductCard key={item.id} item={item} owner={users.find((user) => user.id === item.ownerId)} />
              ))}
            </div>
          </HomeSection>
        </div>

        <HomeSection className="home-band">
          <SectionHeading title="Đang tìm người trao đổi" description="Xem món chủ sở hữu đang có và điều họ mong muốn nhận lại." href="/browse?type=trade" linkLabel="Xem đồ trao đổi" />
          <div className="home-product-grid home-trade-grid">
            {trades.slice(0, 5).map((item) => (
              <HomeProductCard key={item.id} item={item} owner={users.find((user) => user.id === item.ownerId)} tradeFor={item.tradeFor} />
            ))}
          </div>
        </HomeSection>

        <HomeSection className="home-band">
          <SectionHeading title="Khám phá quanh quận của bạn" description="Chọn khu vực thuận tiện để hẹn giao nhận trực tiếp." href="/browse" linkLabel="Xem mọi khu vực" />
          <div className="home-district-panel" aria-label="Khám phá quanh quận của bạn">
            {districtCounts.map(({ name, count }) => (
              <Link key={name} to={`/browse?district=${encodeURIComponent(name)}`} className="home-district">
                <Icon name="location" className="size-6" /><h3>{name}</h3><span>{count} món đang có</span><Icon name="arrow" className="size-4" />
              </Link>
            ))}
          </div>
        </HomeSection>

        <HomeSection className="home-band home-ai-section">
          <div className="home-ai">
            <div className="home-ai-visual">
              <Icon name="ai" className="size-10 text-primary" weight="light" />
              <p className="text-sm font-semibold text-primary">Bạn đang tìm món gì?</p>
              <div className="home-ai-suggestions">
                {['Đèn bàn để đọc sách', 'Sách cho cuối tuần', 'Đồ dùng góc học tập'].map((suggestion) => (
                  <Link key={suggestion} to="/ai"><Icon name="search" className="size-4" />{suggestion}<Icon name="arrow" className="size-4" /></Link>
                ))}
              </div>
            </div>
            <div className="home-ai-copy">
              <p className="text-xs font-bold text-primary">LoopAI</p>
              <h2>Diễn tả món bạn cần theo cách tự nhiên</h2>
              <p>Thử “Tìm xe đạp mini miễn phí ở Bình Thạnh” để nhận gợi ý từ các bài đăng hiện có.</p>
              <Link to="/ai" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover">
                <Icon name="ai" className="size-[18px]" />Mở trợ lý AI<Icon name="arrow" className="size-4" />
              </Link>
            </div>
          </div>
        </HomeSection>

        <div className="home-final-cluster">
          <HomeLifecycle items={gifts.slice(0, 3)} />
          <HomeProcess />
          <HomeSection className="home-band home-cta-band">
            <div className="home-final">
              <div>
                <h2>Có món đồ vẫn còn tốt?</h2>
                <p>Đăng lên SHARELOOP để tặng lại hoặc tìm một món phù hợp để trao đổi.</p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <Link to={currentUser ? '/post' : '/login'} className="home-final-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-primary transition"><Icon name="add" className="size-[18px]" weight="bold" />Đăng món đồ</Link>
                <Link to="/browse" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Tìm đồ <Icon name="arrow" className="size-4" /></Link>
              </div>
            </div>
          </HomeSection>
        </div>

      </HomeMotion>
    </div>
  );
}
