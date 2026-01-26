import { getBlogBySlug } from "@/lib/blogData";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.tags,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: `https://vrikshvalley.com/blogs/${blog.slug}`,
      images: [
        {
          url: blog.image,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author],
    },
  };
}

export default function BlogPostLayout({ children }) {
  return children;
}
