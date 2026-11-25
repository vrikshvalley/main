const titleCase = (slug = "") =>
  decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\band\b/gi, "&")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }) {
  const { category } = await params;
  const name = titleCase(category);
  return {
    title: `${name}: Buy Online`,
    description: `Shop ${name.toLowerCase()} at Vriksh Valley. Hand-picked, nursery-grown and delivered across India with free shipping.`,
    alternates: { canonical: `/category/${category}` },
  };
}

export default function CategoryLayout({ children }) {
  return children;
}
