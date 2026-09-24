import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser, selectData } from '../../app/store';
import {
  Alert,
  Button,
  ConditionBadge,
  Icon,
  OwnerCard,
  StatusBadge,
  TypeBadge,
} from '../../components/ui';
import { feeLabel, requiredCreditForItemType } from '../../utils/credit';
export function ProductDetail() {
  const { id } = useParams();
  const data = useAppSelector(selectData);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [creditError, setCreditError] = useState('');
  const item = data.items.find((x) => x.id === id);
  if (!item)
    return (
      <div className="page-shell">
        <Alert tone="error">Món đồ này không tồn tại hoặc đã được gỡ.</Alert>
      </div>
    );
  const owner = data.users.find((x) => x.id === item.ownerId)!;
  const own = user?.id === item.ownerId;
  const requiredCredit = requiredCreditForItemType(item.type);
  const request = () => {
    if (!user) navigate('/login');
    else if (!own) {
      if (user.reputationStars <= 0) {
        setCreditError('Uy tín của bạn đang ở mức 0 nên hiện không thể gửi yêu cầu nhận hoặc trao đổi.');
        return;
      }
      if (
        user.availableCredit < requiredCredit ||
        (item.type === 'trade' && owner.availableCredit < requiredCredit)
      ) {
        setCreditError('Bạn không đủ Credit để thực hiện thao tác này.');
        return;
      }
      dispatch(actions.createTransaction({ itemId: item.id, requesterId: user.id }));
      navigate('/messages');
    }
  };
  return (
    <div className="page-shell">
      <Link
        to="/browse"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-text-muted hover:text-primary"
      >
        ← Quay lại tìm đồ
      </Link>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0">
          <div className="overflow-hidden rounded-xl bg-surface-container">
            <img
              src={item.images[0]}
              alt={item.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <TypeBadge type={item.type} />
            <ConditionBadge condition={item.condition} />
            <StatusBadge status={item.status} />
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{item.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="location" className="size-4" />
              {item.district}
            </span>
            <span>{item.category}</span>
            <span>Đăng {new Date(item.postedAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <section className="mt-8 border-t border-border pt-6">
            <h2 className="section-title">Về món đồ này</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-[15px] leading-7 text-text-secondary">
              {item.description}
            </p>
            {item.tradeFor ? (
              <div className="mt-5 rounded-lg bg-secondary-soft p-4 text-sm leading-6 text-secondary">
                <strong>Mong muốn trao đổi:</strong> {item.tradeFor}
              </div>
            ) : null}
          </section>
        </main>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg bg-white p-5 ring-1 ring-border/80">
            <p className="text-xs font-semibold text-text-muted">
              {item.type === 'gift' ? 'Yêu cầu nhận món' : 'Gửi đề xuất trao đổi'}
            </p>
            <h2 className="mt-1 text-lg font-bold">{item.district}</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              {item.type === 'gift'
                ? 'Người nhận trả phí giao dịch sau khi hai bên thống nhất lịch.'
                : 'Hai bên cùng giữ phí giao dịch sau khi chốt lịch.'}
            </p>
            <p className="mt-3 text-sm font-semibold text-text-secondary">
              {item.type === 'gift'
                ? `Phi nguoi nhan: ${feeLabel(requiredCredit)}`
                : `Phi cua ban: ${feeLabel(requiredCredit)}`}
            </p>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={own || (item.status !== 'approved' && item.status !== 'APPROVED')}
              onClick={request}
            >
              {own
                ? 'Đây là món của bạn'
                : item.type === 'gift'
                  ? 'Xin nhận món này'
                  : 'Đề xuất trao đổi'}
            </Button>
            {!user ? (
              <p className="mt-3 text-center text-xs text-text-muted">
                Bạn sẽ đăng nhập trước khi gửi yêu cầu.
              </p>
            ) : null}
            {creditError ? (
              <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs leading-5 text-warning">
                <p>{creditError}</p>
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/credit')}
                >
                  Nạp Credit
                </Button>
              </div>
            ) : null}
          </div>
          <OwnerCard owner={owner} />
        </aside>
      </div>
    </div>
  );
}
