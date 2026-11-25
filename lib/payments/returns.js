/**
 * Return policy (as published on /cancellation-refund): a return or refund must
 * be requested within 7 days of delivery. The delivery date comes from the
 * courier's webhook; if we don't have one, the request goes to the team to verify.
 */
export const RETURN_WINDOW_DAYS = 7;

export function returnWindowStatus(order, now = new Date()) {
  const delivered = order?.delivered_date ? new Date(order.delivered_date) : null;
  if (!delivered || Number.isNaN(delivered.getTime())) return { open: true, verified: false, daysLeft: null };
  const elapsedDays = (now.getTime() - delivered.getTime()) / 86_400_000;
  return {
    open: elapsedDays <= RETURN_WINDOW_DAYS,
    verified: true,
    daysLeft: Math.max(0, Math.ceil(RETURN_WINDOW_DAYS - elapsedDays)),
  };
}
