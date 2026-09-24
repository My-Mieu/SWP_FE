import { useState } from 'react';
import { Field, Icon } from './ui';

export function PasswordField({ label, value, onChange, error, autoComplete }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Field
        required
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        error={error}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="pr-11"
      />
      <button
        type="button"
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-8 grid size-9 place-items-center rounded-md text-text-muted hover:bg-surface-low hover:text-primary"
      >
        <Icon name={visible ? 'eyeSlash' : 'eye'} className="size-5" />
      </button>
    </div>
  );
}
