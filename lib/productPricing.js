/**
 * Product price normalisation, shared by the website (productService) and the
 * server-side order pricing (lib/server/orders.js), so the amount a customer is
 * charged is always exactly the price the site showed.
 *
 * Catalogue records keep prices in several shapes (a number, a string, an
 * object, or a `variants` array whose FIRST entry is the displayed price). The
 * raw top-level `price` field can differ from that displayed price.
 */

/**
 * Normalize price/alternate-price fields into a consistent variants array
 * and return a numeric `price` (first variant price or base price).
 */
export function normalizePriceVariants(data) {
  if (!data) return { price: 0, variants: null };

  const variants = [];
  const getNumber = (v) => {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    const s = String(v).replace(/[^0-9.]/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const coerceVariant = (variant, idx = 0) => {
    const price = getNumber(
      variant?.price ??
        variant?.Price ??
        variant?.value ??
        variant?.amount ??
        0,
    );
    const label =
      variant?.label || variant?.name || variant?.id || `option ${idx + 1}`;
    const id = variant?.id || variant?.name || `v${idx}`;

    return {
      id: String(id),
      name: String(variant?.name || label),
      label: String(label),
      price: Number.isFinite(price) ? price : 0,
    };
  };

  const pushVariant = (id, label, raw) => {
    const price = getNumber(raw);
    if (!Number.isNaN(price)) {
      const fallbackLabel = label || id || `option ${variants.length + 1}`;
      variants.push({
        id: String(id || fallbackLabel || variants.length),
        name: String(label || id || fallbackLabel),
        label: String(fallbackLabel),
        price,
      });
    }
  };

  // If variants are already present on the document, trust them but normalize shape
  if (Array.isArray(data.variants) && data.variants.length > 0) {
    const normalized = data.variants.map((variant, idx) =>
      coerceVariant(variant, idx),
    );
    const basePrice = Number.isFinite(normalized[0]?.price)
      ? normalized[0].price
      : getNumber(data.price ?? data.Price ?? data.priceValue ?? 0) || 0;

    return { price: basePrice, variants: normalized };
  }

  const priceField = data.Price ?? data.price ?? data.priceValue ?? null;

  if (Array.isArray(priceField)) {
    for (const item of priceField) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        for (const [k, v] of Object.entries(item)) pushVariant(k, k, v);
      } else {
        pushVariant(item, item, item);
      }
    }
  } else if (priceField && typeof priceField === "object") {
    for (const [k, v] of Object.entries(priceField)) pushVariant(k, k, v);
  } else if (priceField != null) {
    // string or number
    if (typeof priceField === "string") {
      // try to extract numbers from comma/pipe separated values
      const parts = priceField
        .split(/[;,|]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const p of parts) {
        if (!/\d/.test(p)) continue;
        const n = getNumber(p);
        if (!Number.isNaN(n)) {
          const colonMatch = p.match(/^([^:]+):\s*\d/);
          const label = colonMatch ? colonMatch[1].trim() : parts.find((x) => !/\d/.test(x)) || `option-${variants.length + 1}`;
          pushVariant(label, label, n);
        }
      }
      // fallback: if whole string is number-like
      if (variants.length === 0) {
        const n = getNumber(priceField);
        if (!Number.isNaN(n)) pushVariant("default", "default", n);
      }
    } else {
      pushVariant("default", "default", priceField);
    }
  }

  // also inspect any keys that include 'alternate' to collect more variants
  for (const key of Object.keys(data)) {
    if (/alternate/i.test(key)) {
      const val = data[key];
      if (Array.isArray(val)) {
        for (const v of val) pushVariant(key, key, v);
      } else if (val && typeof val === "object") {
        for (const [k, v] of Object.entries(val)) pushVariant(k, k, v);
      } else pushVariant(key, key, val);
    }
  }

  if (variants.length === 0) {
    const base =
      getNumber(data.price ?? data.Price ?? data.priceValue ?? 0) || 0;
    return { price: base, variants: null };
  }

  // unique by label+price
  const seen = new Set();
  const unique = [];
  for (const v of variants) {
    const key = `${v.label}::${v.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(v);
    }
  }

  // ensure deterministic ids
  unique.forEach((u, idx) => (u.id = u.id || `v${idx}`));

  return { price: unique[0].price || 0, variants: unique };
}

/** Stock as the site shows it: `stock`, falling back to `quantity`, else 0. */
export function stockOf(raw) {
  return raw.stock !== undefined ? Number(raw.stock) : Number(raw.quantity) || 0;
}

/**
 * A catalogue record exactly as the site shows it (shared with productService
 * so the server charges what the customer saw): normalised price and
 * variants, stock, images, and whether the price is "on request".
 */
export function normalizeProductRecord(raw) {
  const norm = normalizePriceVariants(raw);
  return {
    ...raw,
    images: raw.images || (raw.image ? [raw.image] : []),
    price: norm.price || 0,
    variants: norm.variants,
    stock: stockOf(raw),
    priceOnCustomization:
      raw.priceOnCustomization === true ||
      String(raw.Price || raw.price || "").toLowerCase().includes("custom") ||
      norm.price === 0,
  };
}
