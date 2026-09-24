import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { actions } from '../app/store';
import type { User } from '../types/domain';
import { hashPassword, passwordRules, validatePassword, verifyPassword } from '../utils/passwordSecurity';
import { Alert, Button } from './ui';
import { PasswordField } from './PasswordField';

export function ChangePasswordForm({ user }: { user: User }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccess('');
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    if (!currentPassword) {
      setCurrentError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!newPassword) {
      setNewError('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (!confirmPassword) {
      setConfirmError('Vui lòng nhập mật khẩu xác nhận.');
      return;
    }
    setProcessing(true);
    const currentValid = await verifyPassword(currentPassword, user.password);
    if (!currentValid) {
      setCurrentError('Mật khẩu hiện tại không chính xác.');
      setProcessing(false);
      return;
    }
    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length) {
      setNewError(validationErrors[0]);
      setProcessing(false);
      return;
    }
    if (await verifyPassword(newPassword, user.password)) {
      setNewError(passwordRules.different);
      setProcessing(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError(passwordRules.mismatch);
      setProcessing(false);
      return;
    }
    const currentPasswordHash = user.password;
    const newPasswordHash = await hashPassword(newPassword);
    dispatch(actions.changePassword({ userId: user.id, currentPasswordHash, newPasswordHash }));
    setSuccess('Đổi mật khẩu thành công.');
    setProcessing(false);
    window.setTimeout(() => {
      dispatch(actions.logout());
      navigate('/login', { state: { notice: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' } });
    }, 500);
  };

  return (
    <form onSubmit={submit} className="rounded-xl bg-white p-5 ring-1 ring-border/80 sm:p-6">
      <h2 className="section-title">Đổi mật khẩu</h2>
      <p className="mt-1 text-sm text-text-muted">Để bảo vệ tài khoản, hãy chọn mật khẩu mạnh và không dùng lại mật khẩu cũ.</p>
      {success ? <div className="mt-4"><Alert tone="success">{success}</Alert></div> : null}
      <div className="mt-6 space-y-4">
        <PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} error={currentError} autoComplete="current-password" />
        <PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} error={newError} autoComplete="new-password" />
        <PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} error={confirmError} autoComplete="new-password" />
        <Button disabled={processing}>{processing ? 'Đang xử lý...' : 'Đổi mật khẩu'}</Button>
      </div>
    </form>
  );
}
