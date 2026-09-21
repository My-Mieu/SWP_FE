import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectData } from '../../app/store';
import {
  Button,
  EmptyState,
  Icon,
  PageHeader,
  ProductCard,
  SearchField,
  Select,
} from '../../components/ui';
import { CATEGORIES, CONDITIONS } from '../../constants/domain';
import { conditionLabel } from '../../utils/formatting';
import type { ItemCondition, ItemType } from '../../types/domain';
export function Browse() {
  const [params] = useSearchParams();
  const data = useAppSelector(selectData);
  const { items, users } = data;
  const districts = useMemo(() => dataDistricts(data), [data]);
  const [q, setQ] = useState(params.get('q') ?? '');
  const typeParam = params.get('type');
  const [type, setType] = useState<ItemType | ''>(
    typeParam === 'gift' || typeParam === 'trade' ? typeParam : '',
  );
  const [category, setCategory] = useState(params.get('category') ?? '');
  const [condition, setCondition] = useState<ItemCondition | ''>('');
  const [district, setDistrict] = useState(params.get('district') ?? '');
  const [mobileFilters, setMobileFilters] = useState(false);
  const results = useMemo(
    () =>
      items
        .filter((i) => i.status === 'approved')
        .filter((i) => !q || `${i.title} ${i.description}`.toLowerCase().includes(q.toLowerCase()))
        .filter((i) => !type || i.type === type)
        .filter((i) => !category || i.category === category)
        .filter((i) => !condition || i.condition === condition)
        .filter((i) => !district || i.district === district),
    [items, q, type, category, condition, district],
  );
  const reset = () => {
    setQ('');
    setType('');
    setCategory('');
    setCondition('');
    setDistrict('');
  };
  const filters = (
    <>
      <SearchField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tên món đồ, mô tả..."
      />
      <Select
        label="Hình thức"
        value={type}
        onChange={(e) => setType(e.target.value as ItemType | '')}
      >
        <option value="">Tất cả</option>
        <option value="gift">Cho tặng</option>
        <option value="trade">Trao đổi</option>
      </Select>
      <Select label="Danh mục" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Tất cả</option>
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select
        label="Tình trạng"
        value={condition}
        onChange={(e) => setCondition(e.target.value as ItemCondition | '')}
      >
        <option value="">Tất cả</option>
        {CONDITIONS.map((c) => (
          <option key={c} value={c}>
            {conditionLabel[c]}
          </option>
        ))}
      </Select>
      <Select label="Quận" value={district} onChange={(e) => setDistrict(e.target.value)}>
        <option value="">Tất cả quận</option>
        {districts.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </Select>
      <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
        Xóa bộ lọc
      </Button>
    </>
  );
  return (
    <div className="page-shell">
      <PageHeader
        title="Tìm đồ"
        description="Lọc các món đã được duyệt theo nhu cầu và quận của bạn."
        action={
          <Button
            variant="outline"
            icon="filter"
            className="lg:hidden"
            onClick={() => setMobileFilters(!mobileFilters)}
          >
            Bộ lọc
          </Button>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          className={`${mobileFilters ? 'block' : 'hidden'} h-fit space-y-4 rounded-lg bg-white p-4 ring-1 ring-border/80 lg:block`}
        >
          <div className="hidden items-center gap-2 border-b border-border pb-3 text-sm font-bold lg:flex">
            <Icon name="filter" className="size-4" />
            Bộ lọc
          </div>
          {filters}
        </aside>
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              <strong className="text-text-primary">{results.length}</strong> món phù hợp
            </p>
            <select className="rounded-md border-0 bg-transparent text-xs font-semibold text-text-secondary outline-none">
              <option>Mới nhất</option>
              <option>Gần ngày hết hạn</option>
            </select>
          </div>
          {results.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  owner={users.find((u) => u.id === item.ownerId)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa tìm thấy món phù hợp"
              text="Thử bỏ bớt một bộ lọc hoặc tìm với từ khóa rộng hơn."
              action={
                <Button variant="outline" onClick={reset}>
                  Đặt lại bộ lọc
                </Button>
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

function dataDistricts(data: ReturnType<typeof selectData>) {
  return data.districts.filter((district) => district.status === 'active').map((district) => district.name);
}
