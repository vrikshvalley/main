import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import { getRecentBlogs } from '@/lib/blogData';
import '@/styles/ourBlogs.scss';

const formatDate = (date, opts) => new Date(date).toLocaleDateString('en-IN', opts);

/**
 * Latest blog posts. Server component, so the blog content in lib/blogData.js
 * never ships to the browser. One markup for all screens: a grid on desktop,
 * a native swipe row on phones.
 */
export default function OurBlogs() {
  const recentBlogs = getRecentBlogs(3);

  return (
    <section className="our-blogs">
      <div className="our-blogs-container">
        <div className="blogs-header scroll-fade">
          <p className="cursive-subtitle">Plant Stories</p>
          <AnimatedText as="h2" text="Our Blogs" className="blogs-title" delay={0.1} stagger={0.05} />
          <AnimatedText
            as="p"
            text="Explore expert tips, guides and stories from the world of plants"
            className="blogs-subtitle"
            delay={0.2}
          />
        </div>

        <div className="blogs-grid">
          {recentBlogs.map((blog) => (
            <article key={blog.id} className="blog-card scroll-fade">
              <Link href={`/blogs/${blog.slug}`} className="blog-image-wrapper" tabIndex={-1} aria-hidden="true">
                <Image
                  src={blog.image}
                  alt=""
                  width={400}
                  height={250}
                  sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
                  className="blog-image"
                />
                <div className="blog-date-badge">{formatDate(blog.date, { day: 'numeric', month: 'short' })}</div>
                <div className="blog-category">{blog.category}</div>
              </Link>

              <div className="blog-content">
                <div className="blog-meta">
                  <span className="meta-item">
                    <Calendar size={14} aria-hidden="true" />
                    {formatDate(blog.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="meta-item">
                    <Clock size={14} aria-hidden="true" />
                    {blog.readTime}
                  </span>
                </div>

                <h3 className="blog-title">
                  <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                </h3>

                <p className="blog-excerpt">{blog.excerpt}</p>

                <div className="blog-footer">
                  <div className="author">
                    <User size={16} aria-hidden="true" />
                    <span>{blog.author}</span>
                  </div>
                  <Link href={`/blogs/${blog.slug}`} className="read-more" aria-label={`Read more: ${blog.title}`}>
                    Read more
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="view-all-wrapper">
          <Link href="/blogs" className="view-all-btn">
            View all blogs
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
