/**
 * Delivery address / contact validation shared by the checkout form (client)
 * and the order API (server). Returns { value } with a normalised copy, or
 * { errors } keyed by field.
 */

const clean = (v, max = 120) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export function normalisePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

export function validateAddress(input = {}) {
  const value = {
    name: clean(input.name, 80),
    phone: normalisePhone(input.phone),
    line1: clean(input.line1, 160),
    line2: clean(input.line2, 160),
    landmark: clean(input.landmark, 80),
    city: clean(input.city, 60),
    state: clean(input.state, 60),
    pincode: String(input.pincode || "").replace(/\D/g, ""),
  };

  const errors = {};
  if (value.name.length < 2) errors.name = "Enter the recipient's full name";
  if (!value.phone) errors.phone = "Enter a valid 10-digit mobile number";
  if (value.line1.length < 5) errors.line1 = "Enter the house / flat and street";
  if (value.city.length < 2) errors.city = "Enter the city";
  if (value.state.length < 2) errors.state = "Enter the state";
  if (!/^[1-9]\d{5}$/.test(value.pincode)) errors.pincode = "Enter a valid 6-digit pincode";

  return Object.keys(errors).length ? { errors } : { value };
}

export function validateEmail(raw) {
  const email = clean(raw, 120).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

/** Two saved addresses are the same place if pincode and first line match. */
export function addressKey(a = {}) {
  const norm = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${norm(a.pincode)}|${norm(a.line1)}`;
}

/** Adds `address` to a saved-address list unless it is already there. Returns a new array. */
export function mergeAddress(list, address) {
  const current = Array.isArray(list) ? list : [];
  if (!address) return current;
  const key = addressKey(address);
  if (current.some((a) => addressKey(a) === key)) return current;
  return [...current, { id: Date.now(), ...address }];
}
