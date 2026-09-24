import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import { Alert, Button, EmptyState, PageHeader, ProductCard, TextArea } from '../../components/ui';
import { CATEGORIES } from '../../constants/domain';
import { findNeedMatches, parseNeed } from '../../utils/aiMatching';
import type { Item, ItemType } from '../../types/domain';
import { AI_ASSISTANT_SEARCH_FEE } from '../../utils/credit';

export function AI() {
  const data = useAppSelector(selectData);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const districts = useMemo(
    () => data.districts.filter((entry) => entry.status === 'active').map((entry) => entry.name),
    [data.districts],
  );
  const [text, setText] = useState('');
  const [type, setType] = useState<ItemType | ''>('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [creditError, setCreditError] = useState(false);
  const slideshowItems = useMemo(
    () =>
      ['item_022', 'item_005', 'item_001', 'item_024', 'item_014', 'item_006', 'item_009', 'item_011', 'item_016', 'item_008']
        .map((id) => data.items.find((item) => item.id === id))
        .filter((item): item is Item => Boolean(item)),
    [data.items],
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const results = useMemo(
    () => findNeedMatches(data.items, text, { type, district, category }),
    [category, data.items, district, text, type],
  );

  useEffect(() => {
    if (slideshowItems.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % slideshowItems.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [slideshowItems.length]);

  useEffect(() => {
    if (activeImageIndex >= slideshowItems.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, slideshowItems.length]);
  const analyze = () => {
    if (user && user.availableCredit < AI_ASSISTANT_SEARCH_FEE) {
      setCreditError(true);
      return;
    }
    setCreditError(false);
    if (user) dispatch(actions.useAiFeature({ userId: user.id, feature: 'ASSISTANT_SEARCH' }));
    const parsed = parseNeed(text, CATEGORIES, districts);
    setType(parsed.type);
    setDistrict(parsed.district);
    setCategory(parsed.category);
    setHasSearched(true);
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Trợ lý tìm đồ"
        description="Mô tả nhu cầu bằng tiếng Việt. Trợ lý chỉ tìm trong các bài đăng SHARELOOP."
      />
      <div className="space-y-10">
        <div className="grid overflow-hidden rounded-[20px] bg-white ring-1 ring-border/70 lg:h-[440px] lg:grid-cols-2">
          <aside className="flex flex-col justify-center bg-[#eef6f2] p-8 sm:p-12 lg:p-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              LoopAI · Tìm đồ thông minh
            </p>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-text-primary sm:text-3xl">
              Bạn đang tìm món gì?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-text-muted">
              Mô tả món đồ bạn cần bằng cách tự nhiên, LoopAI sẽ tìm trong các bài đăng của cộng đồng.
            </p>
            <TextArea
              className="mt-6"
              value={text}
              placeholder="Ví dụ: Tìm xe đạp mini miễn phí ở Bình Thạnh"
              onChange={(event) => setText(event.target.value)}
              aria-label="Bạn đang cần món gì?"
            />
            <Button className="mt-4 w-full sm:w-auto" icon="ai" onClick={analyze}>
              Phân tích nhu cầu
            </Button>
            {creditError ? (
              <Alert tone="error">
                <p>Bạn không đủ Credit để thực hiện thao tác này.</p>
                <Button className="mt-2" size="sm" variant="outline" onClick={() => (window.location.href = '/credit')}>
                  Nạp Credit
                </Button>
              </Alert>
            ) : null}
          </aside>
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-0" aria-label="Ảnh sản phẩm SHARELOOP">
            {slideshowItems.map((item, index) => (
              <img
                key={item.id}
                src={item.images[0]}
                alt={index === activeImageIndex ? item.title : ''}
                aria-hidden={index === activeImageIndex ? undefined : true}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === activeImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>
        </div>

        {hasSearched ? (
          <section>
            <h2 className="section-title">{results.length} món phù hợp</h2>
            <p className="mt-1 text-sm text-text-muted">
              Tất cả kết quả đều đang có trên SHARELOOP.
            </p>
            {results.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    owner={data.users.find((user) => user.id === item.ownerId)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="Chưa có món khớp nhu cầu"
                  text="Thử đổi quận, hình thức hoặc mô tả rộng hơn."
                />
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
