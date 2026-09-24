const PBKDF2_PREFIX = 'pbkdf2';
const PBKDF2_ITERATIONS = 120000;

export const passwordRules = {
  required: 'Vui lòng nhập mật khẩu.',
  length: 'Mật khẩu mới phải có từ 8–32 ký tự.',
  complexity: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.',
  whitespace: 'Mật khẩu không được có khoảng trắng ở đầu hoặc cuối.',
  different: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
  mismatch: 'Mật khẩu xác nhận không khớp.',
};

export function validatePassword(password: string) {
  const errors: string[] = [];
  if (!password) errors.push(passwordRules.required);
  else if (password.trim() !== password) errors.push(passwordRules.whitespace);
  if (password.length < 8 || password.length > 32) errors.push(passwordRules.length);
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    errors.push(passwordRules.complexity);
  }
  return errors;
}

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

export async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(bits)}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [prefix, iterations, encodedSalt, expected] = storedHash.split('$');
  if (prefix !== PBKDF2_PREFIX || Number(iterations) !== PBKDF2_ITERATIONS || !encodedSalt || !expected) return false;
  const actual = await hashPassword(password, fromBase64Url(encodedSalt));
  return actual === storedHash;
}

export function isPasswordHash(value: string) {
  return /^pbkdf2\$120000\$[^$]+\$[^$]+$/.test(value);
}

export function generateOtp() {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
