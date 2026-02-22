'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Tag, ArrowRight } from 'lucide-react';
import Topbar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { getBlogBySlug, getRelatedBlogs } from '@/lib/blogData';
import { useSplitType } from '@/lib/hooks/useSplitType';
import '@/styles/blogPost.scss';

export default function BlogPost() {
  const params = useParams();
  const blog = getBlogBySlug(params.slug);
  const relatedBlogs = getRelatedBlogs(params.slug, 3);
  const titleRef = useSplitType('.blog-hero-title', { delay: 0.1, stagger: 0.05, duration: 0.7 });

  useEffect(() => {
    const body = document.querySelector('.content-body');
    if (!body) return;

    const nodes = Array.from(body.childNodes).filter(
      (node) => !(node.nodeType === Node.TEXT_NODE && !node.textContent.trim())
    );

    const fragment = document.createDocumentFragment();
    let altIndex = 0;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('blog-image')) {
        const next = nodes[i + 1];
        const hasTextPair =
          next &&
          next.nodeType === Node.ELEMENT_NODE &&
          !next.classList.contains('blog-image');

        if (hasTextPair) {
          i += 1; // consume the paired text node
        }

        const row = document.createElement('div');
        row.className = `alt-row ${altIndex % 2 === 0 ? 'image-left' : 'image-right'}`;

        const imgCol = document.createElement('div');
        imgCol.className = 'alt-col image-col';
        imgCol.appendChild(node);

        const textCol = document.createElement('div');
        textCol.className = 'alt-col text-col';
        if (hasTextPair) {
          textCol.appendChild(next);
        }

        row.appendChild(imgCol);
        row.appendChild(textCol);
        fragment.appendChild(row);
        altIndex += 1;
      } else {
        fragment.appendChild(node);
      }
    }

    body.innerHTML = '';
    body.appendChild(fragment);
  }, [params.slug]);

  if (!blog) {
    return (
      <>
        <Topbar />
        <Navbar />
        <div className="blog-not-found">
          <h1>Blog Post Not Found</h1>
          <Link href="/blogs" className="back-link">
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
      <Topbar />
      <Navbar />
      <Breadcrumbs 
        items={[
          { label: 'Blog', href: '/blogs' },
          { label: blog.title }
        ]} 
      />
      
      <article className="blog-post-wrapper" ref={titleRef}>
        <motion.div 
          className="blog-hero-banner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="hero-background-image">
            <Image 
              src={blog.image}
              alt={blog.title}
              fill
              sizes="100vw"
              priority
              className="hero-image"
            />
            <div className="overlay-gradient"></div>
          </div>
          
          <div className="hero-content-overlay">
            <div className="hero-meta-top">
              <span className="blog-category-pill">{blog.category}</span>
              <span className="separator">•</span>
              <span className="blog-read-time">
                <Clock size={16} />
                {blog.readTime}
              </span>
            </div>
            
            <h1 className="blog-title blog-hero-title">{blog.title}</h1>
            
            {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}
            
            <div className="blog-author-meta">
              <div className="author-info">
                <User size={18} />
                <span>{blog.author}</span>
              </div>
              <div className="date-info">
                <Calendar size={18} />
                <span>{new Date(blog.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="blog-content-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="content-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <div className="blog-footer-tags">
            <Tag size={20} />
            <div className="tags-list">
              {blog.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="blog-navigation">
            <Link href="/blogs" className="back-to-blog">
              <ArrowLeft size={20} />
              Back to All Blogs
            </Link>
          </div>
        </motion.div>
      </article>

      {relatedBlogs.length > 0 && (
        <motion.section 
          className="related-blogs"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="related-blogs-container">
            <h2>Related Articles</h2>
            <div className="related-blogs-grid">
              {relatedBlogs.map(relatedBlog => (
                <article key={relatedBlog.id} className="related-blog-card">
                  <Link href={`/blogs/${relatedBlog.slug}`} className="related-image-wrapper">
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

                    <Link href={`/blogs/${relatedBlog.slug}`}>
                      <h3 className="related-title">{relatedBlog.title}</h3>
                    </Link>

                    <Link href={`/blogs/${relatedBlog.slug}`} className="read-more">
                      Read Article
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      <Footer />
      <WhatsAppButton />
    </>
  );
}
