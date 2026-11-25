/**
 * Plants in the homepage "Living Shelf" hero.
 *
 * Images are background-removed product photos in /public/hero (WebP).
 * Care chips come from each product's Firestore record (additionalDetails,
 * maintenanceLevel, petFriendly). Prices are left out on purpose so they
 * can never go stale here.
 *
 * placement:
 *  - "shelf":   stands on the wooden shelf (left to right in array order)
 *  - "hanging": hangs from the vine garland at the top left
 *  - "edge":    sits on the right end of the shelf, its vine trailing over the edge
 *
 * Plants on the "edge" also give potBaseRatio: where the pot's base sits as a
 * fraction of the image height, so the pot lands exactly on the plank.
 */
export const HERO_PLANTS = [
  {
    slug: "dischidia",
    name: "Dischidia",
    image: "/hero/dischidia.webp",
    width: 289,
    height: 440,
    placement: "hanging",
    chips: ["Bright indirect light", "Water weekly", "Trailing"],
  },
  {
    slug: "money-plant",
    name: "Money Plant",
    image: "/hero/money-plant-cutout.webp",
    width: 460,
    height: 695,
    placement: "edge",
    potBaseRatio: 0.528,
    chips: ["Low to bright light", "Water when dry", "Easy care"],
  },
  {
    slug: "areca-palm",
    name: "Areca Palm",
    image: "/hero/areca-palm.webp",
    width: 354,
    height: 440,
    placement: "shelf",
    chips: ["Bright indirect light", "Mist weekly", "Pet-friendly"],
  },
  {
    slug: "snake-plant",
    name: "Snake Plant",
    image: "/hero/snake-plant.webp",
    width: 205,
    height: 440,
    placement: "shelf",
    chips: ["Low to bright light", "Water every 3-4 weeks", "Easy care"],
  },
  {
    slug: "african-violet",
    name: "African Violet",
    image: "/hero/african-violet.webp",
    width: 440,
    height: 433,
    placement: "shelf",
    chips: ["Bright indirect light", "Flowering", "6-inch pot"],
  },
  {
    slug: "zz-plant",
    name: "ZZ Plant",
    image: "/hero/zz-plant.webp",
    width: 341,
    height: 440,
    placement: "shelf",
    chips: ["Low to bright light", "Water when dry", "Easy care"],
  },
];

export const HERO_WHATSAPP_NUMBER = "919204745612";
