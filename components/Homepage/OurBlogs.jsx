'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from '@/components/general/ImgWithLoader';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { getRecentBlogs } from '@/lib/blogData';
import '@/styles/ourBlogs.scss';

export default function OurBlogs() {
  const recentBlogs = getRecentBlogs(3);

  return (
    <section className="our-blogs">
      <div className="our-blogs-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ fontSize: "3rem" }}>Our Blogs</h1>
          <p>Explore expert tips, guides, and stories from the world of plants</p>
        </motion.div>

        <div className="blogs-grid">
          {recentBlogs.map((blog, index) => (
            <motion.article 
              key={blog.id}
              className="blog-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/blog/${blog.slug}`} className="blog-image-wrapper">
                <Image 
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="blog-image"
                />
                <div className="blog-category">{blog.category}</div>
              </Link>

              <div className="blog-content">
                <div className="blog-meta">
                  <span className="meta-item">
                    <Calendar size={14} />
                    {new Date(blog.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span className="meta-item">
                    <Clock size={14} />
                    {blog.readTime}
                  </span>
                </div>

                <Link href={`/blog/${blog.slug}`}>
                  <h3 className="blog-title">{blog.title}</h3>
                </Link>

                <p className="blog-excerpt">{blog.excerpt}</p>

                <div className="blog-footer">
                  <div className="author">
                    <User size={16} />
                    <span>{blog.author}</span>
                  </div>
                  <Link href={`/blog/${blog.slug}`} className="read-more">
                    Read More
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div 
          className="view-all-wrapper"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/blogs" className="view-all-btn">
            View Blogs
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
