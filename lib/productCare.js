/**
 * Turns a product's free-text `additionalDetails` into structured care rows.
 *
 * Input looks like:
 *   "Water- When soil dry | Sunlight - Bright indirect light | Temperature- 18-28°C | Prune trailing stems"
 * Output:
 *   [{ key: "water", label: "Water", value: "When soil dry" }, ...,
 *    { key: "note", label: null, value: "Prune trailing stems" }]
 */
const KEY_ALIASES = {
  water: "water",
  watering: "water",
  sunlight: "light",
  light: "light",
  temperature: "temperature",
  temp: "temperature",
  humidity: "humidity",
  "potting mix": "soil",
  soil: "soil",
  pruning: "pruning",
  prune: "pruning",
  fertilizer: "feeding",
  fertiliser: "feeding",
  feeding: "feeding",
};

export function parseCareDetails(text) {
  if (!text || typeof text !== "string") return [];

  return text
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      // "Label - value" or "Label: value"; the label is letters/spaces only, so
      // values such as "18-28°C" keep their own dashes.
      const match = part.match(/^([A-Za-z][A-Za-z ]{1,24}?)\s*[-:–]\s*(.+)$/);
      if (!match) return { key: "note", label: null, value: part };
      const label = match[1].trim();
      const key = KEY_ALIASES[label.toLowerCase()] || "other";
      return { key, label, value: match[2].trim() };
    });
}

/** Pick the short "at a glance" facts for the buy box. */
export function careHighlights(product) {
  const rows = parseCareDetails(product?.additionalDetails);
  const pick = (key) => rows.find((r) => r.key === key)?.value;
  const facts = [];
  const light = pick("light");
  const water = pick("water");
  const temperature = pick("temperature");
  const humidity = pick("humidity");
  if (light) facts.push({ key: "light", label: "Light", value: light });
  if (water) facts.push({ key: "water", label: "Water", value: water });
  if (temperature) facts.push({ key: "temperature", label: "Temperature", value: temperature });
  if (humidity) facts.push({ key: "humidity", label: "Humidity", value: humidity });
  if (product?.maintenanceLevel) facts.push({ key: "care", label: "Care", value: `${product.maintenanceLevel} maintenance` });
  if (product?.petFriendly) {
    const safe = !/not/i.test(product.petFriendly);
    facts.push({ key: safe ? "pet" : "petWarn", label: "Pets", value: safe ? "Pet-friendly" : "Keep away from pets" });
  }
  return facts;
}
