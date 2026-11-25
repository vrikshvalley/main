const titleCase = (slug = "") =>
  decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\band\b/gi, "&")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }) {
  const { category, subcategory } = await params;
  const name = titleCase(subcategory);
  return {
    title: `${name}: Buy Online`,
    description: `Shop ${name.toLowerCase()} from our ${titleCase(category).toLowerCase()} range. Free shipping across India.`,
    alternates: { canonical: `/category/${category}/${subcategory}` },
  };
}

export default function SubcategoryLayout({ children }) {
  return children;
}
