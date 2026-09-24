import { Icon } from '../../components/ui';
import { Link } from 'react-router-dom';
import type { Item } from '../../types/domain';

const values = [
  ['package', '01', 'CHO ĐI', 'Món đồ bạn không còn dùng'],
  ['search', '02', 'TÌM ĐỒ', 'Tìm món đồ bạn đang cần'],
  ['group', '03', 'GẶP GỠ & TRAO ĐỔI', 'Hoàn tất một vòng đời mới'],
];
const lifecycleImage = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=82`;
const lifecycleImages = [
  {
    src: lifecycleImage('photo-1518455027359-f3f8164ba6bd'),
    alt: 'Warm study corner with a desk lamp and books',
  },
  {
    src: lifecycleImage('photo-1542291026-7eec264c27ff'),
    alt: 'Clean Nike sneakers in natural lifestyle light',
  },
  {
    src: lifecycleImage('photo-1523381294911-8d3cead13475'),
    alt: 'Clothes hanging in a bright reuse-focused space',
  },
];
const steps = [
  ['add', 'Đăng hoặc tìm món', 'Chia sẻ món bạn có, hoặc lọc theo nhu cầu và quận.'],
  ['messages', 'Trò chuyện và chốt lịch', 'Thống nhất món trao đổi, thời gian và điểm giao nhận.'],
  ['check', 'Xác nhận hoàn tất', 'Hai bên xác nhận bàn giao để khép lại giao dịch an toàn.'],
];

export function HomeLifecycle({ items }: { items: Item[] }) {
  return (
      <section className="home-values">
        <div className="home-inner">
          <div className="home-lifecycle">
          <div className="home-lifecycle-copy">
            <p className="home-lifecycle-eyebrow">SHARELOOP • VÒNG ĐỜI MỚI</p>
            <h2>Mỗi món đồ đều có thể có thêm một vòng đời</h2>
            <p className="home-lifecycle-description">
              Thay vì để những món đồ còn tốt bị lãng phí, ShareLoop giúp chúng tiếp tục hữu ích
              với một người khác trong cộng đồng.
            </p>
            <span className="home-lifecycle-divider" aria-hidden="true" />
            <div className="home-lifecycle-steps">
              {values.map(([icon, number, title, description]) => (
                <article key={number} className="home-value">
                  <Icon name={icon} className="size-6" />
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <Link to="/browse" className="home-lifecycle-cta">
              Khám phá món đồ
              <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <div className="home-lifecycle-visual">
            <div className="home-lifecycle-collage" aria-label="Một số món đồ trong cộng đồng">
              {lifecycleImages.map((image, index) => (
                <img
                  key={items[index]?.id ?? image.src}
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className={`home-lifecycle-collage-image home-lifecycle-collage-image-${index + 1}`}
                />
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>
  );
}

export function HomeProcess() {
  return (
      <section className="home-process home-inner">
        <div className="home-process-intro">
          <h2>Một vòng chia sẻ thật đơn giản</h2>
          <p>Mọi kết nối bắt đầu từ một món đồ còn giá trị.</p>
        </div>
        <ol>
          {steps.map(([icon, title, description], index) => (
            <li key={title}>
              <div className="home-step-top">
                <span>0{index + 1}</span>
                <Icon name={icon} className="size-5" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              {index < steps.length - 1 && <Icon name="arrow" className="home-step-arrow size-4" />}
            </li>
          ))}
        </ol>
      </section>
  );
}

export function HomeCommunity({ item }: { item?: Item }) {
  return (
    <>
      <HomeLifecycle items={item ? [item] : []} />
      <HomeProcess />
    </>
  );
}
