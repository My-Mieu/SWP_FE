import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectData } from '../../app/store';
import { Alert, Button, Field, PageHeader } from '../../components/ui';
import { PasswordField } from '../../components/PasswordField';
import { generateOtp, hashPassword, passwordRules, validatePassword, validEmail, verifyPassword } from '../../utils/passwordSecurity';

type Step = 'email' | 'otp' | 'reset';

export function ForgotPassword() {
  const data = useAppSelector(selectData);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [processing, setProcessing] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const createOtpRequest = async (resend = false) => {
    setProcessing(true);
    setError('');
    const generated = generateOtp();
    const now = Date.now();
    const payload = {
      otpHash: await hashPassword(generated),
      expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
      resendAvailableAt: new Date(now + 60 * 1000).toISOString(),
    };
    if (resend && data.passwordReset) {
      dispatch(actions.resendPasswordOtp({ resetId: data.passwordReset.id, ...payload }));
    } else {
      dispatch(actions.requestPasswordReset({
        email,
        resetId: crypto.randomUUID(),
        resetToken: crypto.randomUUID(),
        ...payload,
      }));
    }
    setSeconds(60);
    setNotice('Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi.');
    setStep('otp');
    setProcessing(false);
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!validEmail(email)) {
      setError(email.trim() ? 'Email không đúng định dạng.' : 'Vui lòng nhập email.');
      return;
    }
    await createOtpRequest();
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    const reset = data.passwordReset;
    if (!/^\d{6}$/.test(otp)) {
      setError('Mã xác thực không hợp lệ.');
      return;
    }
    if (!reset || Date.now() > new Date(reset.expiresAt).getTime()) {
      setError('Mã xác thực đã hết hạn.');
      return;
    }
    if (reset.attempts >= 5) {
      setError('Bạn đã nhập sai quá số lần cho phép.');
      return;
    }
    setProcessing(true);
    const valid = await verifyPassword(otp, reset.otpHash);
    dispatch(actions.verifyPasswordOtp({ resetId: reset.id, otpHash: valid ? reset.otpHash : '' }));
    setProcessing(false);
    if (!valid) {
      setError(reset.attempts + 1 >= 5 ? 'Bạn đã nhập sai quá số lần cho phép.' : 'Mã xác thực không hợp lệ.');
      return;
    }
    setError('');
    setStep('reset');
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    const errors = validatePassword(newPassword);
    if (errors.length) {
      setError(errors[0]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(passwordRules.mismatch);
      return;
    }
    const reset = data.passwordReset;
    if (!reset?.verified || !reset.resetToken) {
      setError('Phiên đặt lại mật khẩu không hợp lệ.');
      return;
    }
    setProcessing(true);
    const newPasswordHash = await hashPassword(newPassword);
    dispatch(actions.resetPassword({ resetId: reset.id, resetToken: reset.resetToken, newPasswordHash }));
    setProcessing(false);
    navigate('/login', { state: { notice: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' } });
  };

  return (
    <div className="page-shell flex min-h-[620px] items-center justify-center">
      <form onSubmit={step === 'email' ? submitEmail : step === 'otp' ? verifyOtp : resetPassword} className="w-full max-w-md rounded-xl bg-white p-6 shadow-md ring-1 ring-border/70 sm:p-8">
        <PageHeader title="Quên mật khẩu" description="Khôi phục quyền truy cập an toàn cho tài khoản của bạn." />
        {notice ? <Alert tone="info">{notice}</Alert> : null}
        {error ? <Alert tone="error">{error}</Alert> : null}
        <div className="mt-6 space-y-4">
          {step === 'email' ? <Field required label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error && !validEmail(email) ? error : undefined} autoComplete="email" /> : null}
          {step === 'otp' ? <>
            <Field required label="Mã xác thực" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} />
            <Button type="button" variant="ghost" disabled={seconds > 0 || processing} onClick={() => void createOtpRequest(true)}>
              {seconds > 0 ? `Gửi lại mã sau 00:${String(seconds).padStart(2, '0')}` : 'Gửi lại mã'}
            </Button>
          </> : null}
          {step === 'reset' ? <>
            <PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} error={error} autoComplete="new-password" />
            <PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          </> : null}
          <Button className="w-full" disabled={processing}>
            {step === 'email' ? 'Gửi mã xác thực' : step === 'otp' ? 'Xác minh mã' : 'Đặt lại mật khẩu'}
          </Button>
        </div>
      </form>
    </div>
  );
}
