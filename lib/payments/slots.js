/**
 * Plant Doctor appointment slots. Pure functions shared by the booking page
 * and the order API, so a slot the page offers is a slot the server accepts.
 * All dates are India time (IST, +05:30) whatever the visitor's own timezone.
 */

export const SLOT_TIMES = [
  { value: "12:00", label: "12 PM" },
  { value: "15:00", label: "3 PM" },
  { value: "17:00", label: "5 PM" },
];

export const MIN_LEAD_MINUTES = 120; // a slot closes 2 hours before it starts
export const BOOKING_WINDOW_DAYS = 7;

const DAY_MS = 86_400_000;

/** "2026-11-26" for the IST calendar day containing `date`. */
export function istDateKey(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function slotStart(dateKey, time) {
  return new Date(`${dateKey}T${time}:00+05:30`);
}

export function isSlotBookable(dateKey, time, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey)) || !SLOT_TIMES.some((t) => t.value === time)) return false;
  const start = slotStart(dateKey, time);
  if (Number.isNaN(start.getTime())) return false;
  const until = start.getTime() - now.getTime();
  return until >= MIN_LEAD_MINUTES * 60_000 && until <= (BOOKING_WINDOW_DAYS + 1) * DAY_MS;
}

/** The next `count` IST calendar days starting today, as "YYYY-MM-DD" keys. */
export function bookingDays(now = new Date(), count = BOOKING_WINDOW_DAYS) {
  return Array.from({ length: count }, (_, i) => istDateKey(new Date(now.getTime() + i * DAY_MS)));
}

/** Identifier of one bookable slot, e.g. "2026-11-27|15:00". */
export const slotId = (dateKey, time) => `${dateKey}|${time}`;

/**
 * Slot times still open on a given day. `taken` is a Set of slotId() values
 * already booked (or being paid for) by someone else: one consultation per slot.
 */
export function openSlots(dateKey, now = new Date(), taken = new Set()) {
  return SLOT_TIMES.filter((t) => isSlotBookable(dateKey, t.value, now) && !taken.has(slotId(dateKey, t.value)));
}
