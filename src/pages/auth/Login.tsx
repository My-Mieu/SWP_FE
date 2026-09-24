import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { actions, selectData } from '../../app/store';
import { Alert, Button, Field, Icon } from '../../components/ui';
import { PasswordField } from '../../components/PasswordField';
import { verifyPassword } from '../../utils/passwordSecurity';
export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const data = useAppSelector(selectData);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const successNotice = (location.state as { notice?: string } | null)?.notice;
  const login = async (name: string, pass: string, target = '/') => {
    setProcessing(true);
    const candidate = data.users.find((u) => u.username === name && u.status !== 'locked');
    const valid = candidate && await verifyPassword(pass, candidate.password) ? candidate : undefined;
    if (!valid) {
      setError('Tên đăng nhập hoặc mật khẩu chưa đúng. Tài khoản bị khóa không thể đăng nhập.');
      setProcessing(false);
      return;
    }
    dispatch(actions.login({ username: name, passwordHash: valid.password }));
    navigate(target);
    setProcessing(false);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    login(username, password);
  };
  const quickLogin = (role: 'user' | 'admin') => {
    setError('');
    setProcessing(false);
    dispatch(actions.demoLogin({ username: role, role }));
    navigate(role === 'admin' ? '/admin' : '/');
  };
  return (
    <div className="page-shell grid min-h-[620px] items-center gap-10 lg:grid-cols-2">
      <section className="hidden max-w-lg lg:block">
        <span className="grid size-12 place-items-center rounded-lg bg-primary text-white">
          <Icon name="renew" className="size-6" weight="bold" />
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight">Chào mừng bạn quay lại cộng đồng.</h1>
        <p className="mt-4 text-base leading-7 text-text-muted">
          Tiếp tục theo dõi món đã đăng, trò chuyện và hoàn tất các giao dịch an toàn.
        </p>
      </section>
      <form
        onSubmit={submit}
        className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-md ring-1 ring-border/70 sm:p-8"
      >
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-2 text-sm text-text-muted">Dùng tài khoản của bạn để tiếp tục.</p>
        {error ? (
          <div className="mt-5">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
        {successNotice ? <div className="mt-5"><Alert tone="success">{successNotice}</Alert></div> : null}
        <div className="mt-6 space-y-4">
          <Field
            required
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <PasswordField label="Mật khẩu" value={password} onChange={setPassword} autoComplete="current-password" />
          <Button className="w-full" disabled={processing}>Đăng nhập</Button>
        </div>
        <Link to="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-primary hover:underline">
          Quên mật khẩu?
        </Link>
        <div className="my-6 flex items-center gap-3 text-xs text-text-muted">
          <span className="h-px flex-1 bg-border" />
          <span>Tài khoản demo</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={() => quickLogin('user')}>
            Người dùng
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => quickLogin('admin')}
          >
            Quản trị viên
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
}
