import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectCurrentUser } from '../../app/store';
import { Alert, Button, PageHeader } from '../../components/ui';
import { PasswordField } from '../../components/PasswordField';
import { hashPassword, passwordRules, validatePassword, verifyPassword } from '../../utils/passwordSecurity';

export function ChangePassword() {
  const user = useAppSelector(selectCurrentUser)!;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!current) nextErrors.current = 'Vui lòng nhập mật khẩu hiện tại.';
    const passwordErrors = validatePassword(next);
    if (passwordErrors.length) nextErrors.next = passwordErrors[0];
    if (next !== confirm) nextErrors.confirm = passwordRules.mismatch;
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setProcessing(true);
    if (!(await verifyPassword(current, user.password))) {
      setErrors({ current: 'Mật khẩu hiện tại không chính xác.' });
      setProcessing(false);
      return;
    }
    if (await verifyPassword(next, user.password)) {
      setErrors({ next: passwordRules.different });
      setProcessing(false);
      return;
    }
    const newHash = await hashPassword(next);
    dispatch(actions.changePassword({ userId: user.id, currentPasswordHash: user.password, newPasswordHash: newHash }));
    setProcessing(false);
    setSuccess(true);
  };

  if (success) return <div className="page-shell max-w-xl"><Alert tone="success">Đổi mật khẩu thành công.</Alert><Button className="mt-5" onClick={() => { dispatch(actions.logout()); navigate('/login'); }}>Đăng nhập lại</Button></div>;
  return <div className="page-shell max-w-xl"><PageHeader title="Đổi mật khẩu" description="Bảo vệ tài khoản bằng mật khẩu mới." /><form onSubmit={submit} className="rounded-xl bg-white p-6 ring-1 ring-border/80 sm:p-8"><div className="space-y-4"><PasswordField label="Mật khẩu hiện tại" value={current} onChange={setCurrent} error={errors.current} autoComplete="current-password" /><PasswordField label="Mật khẩu mới" value={next} onChange={setNext} error={errors.next} autoComplete="new-password" /><PasswordField label="Xác nhận mật khẩu mới" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" /></div><Button className="mt-6 w-full" disabled={processing}>{processing ? 'Đang xử lý…' : 'Đổi mật khẩu'}</Button></form></div>;
}
