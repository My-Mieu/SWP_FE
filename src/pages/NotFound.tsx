import { Link } from 'react-router-dom';
import { Button, Icon } from '../components/ui';

export function NotFound() {
  return (
    <div className="page-shell grid min-h-[520px] place-items-center text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon name="search" className="size-7" />
        </span>
        <p className="mt-5 text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold">Không tìm thấy trang</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-muted">
          Liên kết có thể đã thay đổi hoặc nội dung không còn tồn tại.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
