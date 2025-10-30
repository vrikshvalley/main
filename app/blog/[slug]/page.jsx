'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowLeft, Tag, ArrowRight } from 'lucide-react';
import TopBar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { getBlogBySlug, getRelatedBlogs } from '@/lib/blogData';
import '@/styles/blogPost.scss';

export default function BlogPost() {
  const params = useParams();
  const blog = getBlogBySlug(params.slug);
  const relatedBlogs = getRelatedBlogs(params.slug, 3);

  if (!blog) {
    return (
      <>
        <TopBar />
        <Navbar />
        <div className="blog-not-found">
          <h1>Blog Post Not Found</h1>
          <Link href="/blog" className="back-link">
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Navbar />
      <Breadcrumbs 
        items={[
          { label: 'Blog', href: '/blog' },
          { label: blog.title }
        ]} 
      />
      
      <article className="blog-post">
        <div className="blog-post-header">
          <div className="blog-category-tag">{blog.category}</div>
          <h1>{blog.title}</h1>
          
          <div className="blog-post-meta">
            <div className="meta-item">
              <User size={18} />
              <span>{blog.author}</span>
            </div>
            <div className="meta-item">
              <Calendar size={18} />
              <span>{new Date(blog.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <div className="meta-item">
              <Clock size={18} />
              <span>{blog.readTime}</span>
            </div>
          </div>
        </div>

        <div className="blog-post-image">
          <Image 
            src={blog.image}
            alt={blog.title}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
            className="featured-image"
          />
        </div>

        <div className="blog-post-content">
          <div 
            className="content-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <div className="blog-tags">
            <Tag size={20} />
            <div className="tags-list">
              {blog.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="blog-navigation">
            <Link href="/blog" className="back-to-blog">
              <ArrowLeft size={20} />
              Back to All Blogs
            </Link>
          </div>
        </div>
      </article>

      {relatedBlogs.length > 0 && (
        <section className="related-blogs">
          <div className="related-blogs-container">
            <h2>Related Articles</h2>
            <div className="related-blogs-grid">
              {relatedBlogs.map(relatedBlog => (
                <article key={relatedBlog.id} className="related-blog-card">
                  <Link href={`/blog/${relatedBlog.slug}`} className="related-image-wrapper">
                    <Image 
                      src={relatedBlog.image}
                      alt={relatedBlog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="related-image"
                    />
                    <div className="related-category">{relatedBlog.category}</div>
                  </Link>

                  <div className="related-content">
                    <div className="related-meta">
                      <span className="meta-item">
                        <Calendar size={14} />
                        {new Date(relatedBlog.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="meta-item">
                        <Clock size={14} />
                        {relatedBlog.readTime}
                      </span>
                    </div>

                    <Link href={`/blog/${relatedBlog.slug}`}>
                      <h3 className="related-title">{relatedBlog.title}</h3>
                    </Link>

                    <Link href={`/blog/${relatedBlog.slug}`} className="read-more">
                      Read Article
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppButton />
    </>
  );
}
