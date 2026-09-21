import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Alert,
  Button,
  EmptyState,
  Icon,
  PageHeader,
  ProductCard,
  Select,
  TextArea,
} from '../../components/ui';
import { CATEGORIES, DISTRICTS } from '../../constants/domain';
import { fileToDataUrl } from '../../utils/files';
export function AI() {
  const data = useAppSelector(selectData);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'find' | 'have'>('find');
  const [text, setText] = useState('Tìm xe đạp mini miễn phí ở Bình Thạnh');
  const [category, setCategory] = useState('Đồ điện tử');
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const district = DISTRICTS.find((d) => text.toLowerCase().includes(d.toLowerCase()));
  const type =
    text.toLowerCase().includes('miễn phí') || text.toLowerCase().includes('tặng')
      ? 'gift'
      : text.toLowerCase().includes('đổi')
        ? 'trade'
        : '';
  const results = useMemo(
    () =>
      data.items
        .filter((i) => i.status === 'approved')
        .filter((i) => !district || i.district === district)
        .filter((i) => !type || i.type === type)
        .filter((i) =>
          mode === 'find'
            ? text.toLowerCase().includes('xe đạp')
              ? i.title.toLowerCase().includes('xe đạp')
              : true
            : i.category === category,
        )
        .slice(0, 5),
    [data.items, district, type, text, mode, category],
  );
  const propose = (id: string) => {
    if (!user) navigate('/login');
    else {
      dispatch(actions.createTransaction({ itemId: id, requesterId: user.id }));
      navigate('/messages');
    }
  };
  const cards = (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((item) => (
        <div key={item.id} className="space-y-2">
          <ProductCard item={item} owner={data.users.find((u) => u.id === item.ownerId)} />
          {mode === 'have' ? (
            <Button className="w-full" variant="secondary" onClick={() => propose(item.id)}>
              Chọn và gửi đề xuất
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
  return (
    <div className="page-shell">
      <PageHeader
        title="Trợ lý tìm đồ"
        description="Mô tả nhu cầu bằng tiếng Việt. Trợ lý chỉ tìm trong các món đã được duyệt trên SHARELOOP."
      />
      <div className="mb-7 inline-grid w-full grid-cols-2 rounded-lg bg-surface-low p-1 sm:w-auto">
        <button
          onClick={() => {
            setMode('find');
            setStep(0);
          }}
          className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${mode === 'find' ? 'bg-white text-primary shadow-sm' : 'text-text-muted'}`}
        >
          Tôi đang tìm đồ
        </button>
        <button
          onClick={() => {
            setMode('have');
            setStep(0);
          }}
          className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${mode === 'have' ? 'bg-white text-primary shadow-sm' : 'text-text-muted'}`}
        >
          Tôi có món muốn đổi
        </button>
      </div>
      {mode === 'find' ? (
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-border/80">
            <TextArea
              label="Bạn đang cần món gì?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button className="mt-4 w-full" icon="ai">
              Phân tích nhu cầu
            </Button>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold text-text-muted">Trợ lý đã hiểu</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-text-muted">Hình thức</span>
                  <strong className="mt-1 block">
                    {type === 'gift' ? 'Cho tặng' : type === 'trade' ? 'Trao đổi' : 'Bất kỳ'}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-text-muted">Khu vực</span>
                  <strong className="mt-1 block">{district ?? 'Bất kỳ quận'}</strong>
                </div>
              </div>
            </div>
          </aside>
          <section>
            <h2 className="section-title">{results.length} món phù hợp</h2>
            <p className="mt-1 text-sm text-text-muted">
              Tất cả kết quả đều đang có trên SHARELOOP.
            </p>
            {results.length ? (
              cards
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="Chưa có món khớp nhu cầu"
                  text="Thử đổi quận hoặc mô tả rộng hơn."
                />
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-border/80">
            <ol className="mb-5 flex items-center gap-2">
              {['Ảnh', 'Phân tích', 'Ghép món'].map((label, i) => (
                <li
                  key={label}
                  className={`flex items-center gap-1 text-[11px] font-semibold ${i <= step ? 'text-primary' : 'text-text-muted'}`}
                >
                  <span
                    className={`grid size-6 place-items-center rounded-full ${i <= step ? 'bg-primary text-white' : 'bg-surface-low'}`}
                  >
                    {i + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
            <label className="flex w-full flex-col items-center rounded-lg border border-dashed border-border bg-background px-4 py-8">
              {image ? (
                <img
                  src={image}
                  alt="Món đồ cần phân tích"
                  className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
                />
              ) : (
                <Icon name="image" className="size-8 text-primary" />
              )}
              <strong className="mt-3 text-sm">Tải ảnh món đồ</strong>
              <span className="mt-1 text-xs text-text-muted">JPG hoặc PNG, tối đa 10 MB</span>
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setImage(await fileToDataUrl(file));
                    setStep(1);
                  }
                }}
              />
            </label>
            <Select
              label="Danh mục"
              className="mt-4"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Button
              className="mt-4 w-full"
              icon="ai"
              onClick={() => {
                setDescription(
                  'Món đồ vẫn còn trong tình trạng tốt, được giữ gìn cẩn thận và phù hợp để trao đổi với người đang cần trong cộng đồng.',
                );
                setStep(2);
              }}
            >
              Phân tích món đồ
            </Button>
          </aside>
          <section>
            {step < 2 ? (
              <EmptyState
                icon="ai"
                title="Chờ phân tích món đồ"
                text="Thêm ảnh và danh mục để trợ lý tạo mô tả, sau đó tìm các món phù hợp."
              />
            ) : (
              <>
                <Alert tone="success">
                  Trợ lý đã tạo mô tả. Bạn có thể chỉnh sửa trước khi gửi đề xuất.
                </Alert>
                <div className="mt-4 rounded-lg bg-white p-5 ring-1 ring-border/80">
                  <TextArea
                    label="Mô tả đề xuất"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <h2 className="mt-7 section-title">Món phù hợp để trao đổi</h2>
                {cards}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
