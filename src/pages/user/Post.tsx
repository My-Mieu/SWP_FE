import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser } from '../../app/store';
import { Button, Field, Icon, PageHeader, Select, TextArea } from '../../components/ui';
import { CATEGORIES, CONDITIONS, DISTRICTS } from '../../constants/domain';
import { conditionLabel } from '../../utils/formatting';
import type { ItemCondition, ItemType } from '../../types/domain';
import { fileToDataUrl } from '../../utils/files';
export function Post() {
  const user = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [type, setType] = useState<ItemType>('gift');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [district, setDistrict] = useState(user.district);
  const [description, setDescription] = useState('');
  const [tradeFor, setTradeFor] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(
      actions.addItem({
        ownerId: user.id,
        title,
        description,
        type,
        category,
        condition,
        district,
        images: images.length
          ? images
          : [
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
            ],
        tradeFor: type === 'trade' ? tradeFor : undefined,
      }),
    );
    navigate('/activities');
  };
  return (
    <div className="page-shell max-w-4xl">
      <PageHeader
        title="Đăng món đồ"
        description="Thông tin rõ ràng giúp món đồ sớm tìm được người phù hợp."
      />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="space-y-5 rounded-xl bg-white p-5 ring-1 ring-border/80 sm:p-6">
          <div>
            <span className="label">Hình thức</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('gift')}
                className={`rounded-md border p-4 text-left transition ${type === 'gift' ? 'border-primary bg-primary-faint text-primary' : 'border-border hover:border-primary/40'}`}
              >
                <strong className="block text-sm">Cho tặng</strong>
                <span className="mt-1 block text-xs text-text-muted">
                  Trao món đồ mà không cần đổi lại
                </span>
              </button>
              <button
                type="button"
                onClick={() => setType('trade')}
                className={`rounded-md border p-4 text-left transition ${type === 'trade' ? 'border-secondary bg-secondary-soft text-secondary' : 'border-border hover:border-secondary/40'}`}
              >
                <strong className="block text-sm">Trao đổi</strong>
                <span className="mt-1 block text-xs text-text-muted">
                  Đổi lấy một món phù hợp khác
                </span>
              </button>
            </div>
          </div>
          <Field
            required
            label="Tên món đồ"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Xe đạp mini màu xanh"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Danh mục" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select
              label="Tình trạng"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {conditionLabel[c]}
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Quận giao nhận"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
          <TextArea
            required
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tình trạng thực tế, kích thước và những lưu ý cần biết..."
          />
          {type === 'trade' ? (
            <Field
              label="Bạn muốn đổi lấy gì?"
              value={tradeFor}
              onChange={(e) => setTradeFor(e.target.value)}
              placeholder="Ví dụ: Sách thiếu nhi hoặc cây để bàn"
            />
          ) : null}
        </section>
        <aside className="space-y-4">
          <label className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white text-center transition hover:border-primary">
            <Icon name="image" className="size-8 text-primary" />
            <strong className="mt-3 text-sm">Thêm hình ảnh</strong>
            <span className="mt-1 text-xs text-text-muted">Tối đa 6 ảnh</span>
            <input
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={async (event) => {
                const files = Array.from(event.target.files ?? []).slice(0, 6);
                setImages(await Promise.all(files.map(fileToDataUrl)));
              }}
            />
          </label>
          {images.length ? (
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={image.slice(-16) + index} className="relative">
                  <img
                    src={image}
                    alt={`Ảnh món đồ ${index + 1}`}
                    className="aspect-square rounded-md object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Xóa ảnh"
                    onClick={() => setImages(images.filter((_, itemIndex) => itemIndex !== index))}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white text-error shadow-sm"
                  >
                    <Icon name="close" className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="rounded-lg bg-primary-faint p-4 text-xs leading-5 text-text-secondary">
            <strong className="text-primary">Trước khi đăng</strong>
            <p className="mt-1">
              Bài viết sẽ chờ quản trị viên duyệt. Không đăng thông tin liên hệ trong mô tả.
            </p>
          </div>
          <Button className="w-full" size="lg">
            Gửi bài chờ duyệt
          </Button>
        </aside>
      </form>
    </div>
  );
}
