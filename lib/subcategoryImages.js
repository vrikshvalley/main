/**
 * Corrections for subcategory images whose paths in the Firestore `categories`
 * records point to files that do not exist (or to the wrong picture).
 * Keyed by subcategory slug. Fix the records in Firestore to remove an entry.
 */
const OVERRIDES = {
  "medicinal-plants": { desktop: "/subcategories/MedicinalPlants.webp", mobile: "/subcategories/MedicinalPlants.webp" },
  bonsai: { desktop: "/subcategories/BonsaiDesktop.webp", mobile: "/subcategories/BonsaiMobile.webp" },
  "growbags-and-seedling-tray": { desktop: "/subcategories/GrowbagDesktop.webp", mobile: "/subcategories/GrowbagMobile.webp" },
  plastic: { desktop: "/subcategories/PlasticDesktop.webp", mobile: "/subcategories/PlasticMobile.webp" },
  recycled: { desktop: "/subcategories/RecycledDesktop.webp", mobile: "/subcategories/RecycledMobile.webp" },
  terracota: { desktop: "/subcategories/TerracotaDesktop.webp", mobile: "/subcategories/TerracotaMobile.webp" },
};

export function subcategoryImage(subcat) {
  return OVERRIDES[subcat?.slug] || subcat?.imageUrl || {};
}
