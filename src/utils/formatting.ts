import type { ItemCondition, TransactionStatus } from '../types/domain';

export const conditionLabel: Record<ItemCondition, string> = {
  new: 'Mới',
  good: 'Dùng tốt',
  used: 'Đã qua dùng',
};

export const txLabel: Record<TransactionStatus, string> = {
  NEGOTIATING: 'Đang thương lượng',
  SCHEDULE_PROPOSED: 'Chờ chốt lịch',
  SCHEDULE_CONFIRMED: 'Đã chốt lịch',
  CREDIT_HELD: 'Đã giữ phí',
  WAITING_HANDOVER: 'Chờ giao nhận',
  SENDER_CONFIRMED: 'Bên gửi đã xác nhận',
  RECEIVER_CONFIRMED: 'Bên nhận đã xác nhận',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  DISPUTED: 'Khiếu nại',
};

export function formatCredit(value: number) {
  return `${value.toLocaleString('vi-VN')} Credit`;
}

export function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}
