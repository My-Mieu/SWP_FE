import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import { Button, EmptyState, PageHeader, ProductCard, Select, TextArea } from '../../components/ui';
import { CATEGORIES } from '../../constants/domain';
import { findNeedMatches, parseNeed } from '../../utils/aiMatching';
import type { ItemType } from '../../types/domain';

export function AI() {
  const data = useAppSelector(selectData);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const districts = useMemo(
    () => data.districts.filter((entry) => entry.status === 'active').map((entry) => entry.name),
    [data.districts],
  );
  const [text, setText] = useState('Tìm xe đạp mini miễn phí ở Bình Thạnh');
  const [type, setType] = useState<ItemType | ''>('gift');
  const [district, setDistrict] = useState('Bình Thạnh');
  const [category, setCategory] = useState('');
  const results = useMemo(
    () => findNeedMatches(data.items, text, { type, district, category }),
    [category, data.items, district, text, type],
  );
  const analyze = () => {
    if (user) dispatch(actions.useAiFeature({ userId: user.id, feature: 'ASSISTANT_SEARCH' }));
    const parsed = parseNeed(text, CATEGORIES, districts);
    setType(parsed.type);
    setDistrict(parsed.district);
    setCategory(parsed.category);
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Trợ lý tìm đồ"
        description="Mô tả nhu cầu bằng tiếng Việt. Trợ lý chỉ tìm trong các món đã được duyệt trên SHARELOOP."
      />
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-border/80">
          <TextArea
            label="Bạn đang cần món gì?"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <Button className="mt-4 w-full" icon="ai" onClick={analyze}>
            Phân tích nhu cầu
          </Button>
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-semibold text-text-muted">Trợ lý đã hiểu</p>
            <div className="mt-3 grid gap-3">
              <Select
                label="Hình thức"
                value={type}
                onChange={(event) => setType(event.target.value as ItemType | '')}
              >
                <option value="">Tất cả</option>
                <option value="gift">Cho tặng</option>
                <option value="trade">Trao đổi</option>
              </Select>
              <Select
                label="Khu vực"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
              >
                <option value="">Tất cả quận</option>
                {districts.map((entry) => (
                  <option key={entry}>{entry}</option>
                ))}
              </Select>
              <Select
                label="Danh mục"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {CATEGORIES.map((entry) => (
                  <option key={entry}>{entry}</option>
                ))}
              </Select>
            </div>
          </div>
        </aside>
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
      </div>
    </div>
  );
}
