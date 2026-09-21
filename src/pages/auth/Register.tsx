import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectData } from '../../app/store';
import { Button, Field, Select } from '../../components/ui';
export function Register() {
  const data = useAppSelector(selectData);
  const districts = data.districts
    .filter((entry) => entry.status === 'active')
    .map((entry) => entry.name);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState<string>(districts[0] ?? '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      setStep('otp');
      return;
    }
    dispatch(actions.register({ name, username, password: '12345678', phone, district }));
    navigate('/');
  };
  return (
    <div className="page-shell flex min-h-[620px] items-center justify-center">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-md ring-1 ring-border/70 sm:p-8"
      >
        <div className="mb-7 flex items-center gap-3">
          <span
            className={`h-1 flex-1 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-primary'}`}
          />
          <span
            className={`h-1 flex-1 rounded-full ${step === 'otp' ? 'bg-primary' : 'bg-surface-container'}`}
          />
        </div>
        <h1 className="text-2xl font-bold">
          {step === 'details' ? 'Tạo tài khoản' : 'Xác minh số điện thoại'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          {step === 'details'
            ? 'Tham gia cộng đồng cho tặng và trao đổi trong khu vực.'
            : `Nhập mã 6 số đã gửi đến ${phone || 'số điện thoại của bạn'}.`}
        </p>
        {step === 'details' ? (
          <div className="mt-6 space-y-4">
            <Field
              required
              label="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                required
                label="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Field
                required
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
              />
            </div>
            <Select label="Quận" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {districts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
            <Button className="w-full">Tiếp tục</Button>
          </div>
        ) : (
          <div className="mt-7">
            <div className="grid grid-cols-6 gap-2">
              {otp.map((value, i) => (
                <input
                  key={i}
                  aria-label={`Số OTP ${i + 1}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => {
                    const next = [...otp];
                    next[i] = e.target.value.replace(/\D/g, '');
                    setOtp(next);
                  }}
                  className="aspect-square min-w-0 rounded-md border border-border text-center text-lg font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-text-muted">
              Prototype: có thể xác nhận với bất kỳ mã nào.
            </p>
            <Button className="mt-5 w-full">Xác minh và tạo tài khoản</Button>
            <Button
              type="button"
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => setStep('details')}
            >
              Quay lại chỉnh thông tin
            </Button>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-text-muted">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-primary">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
