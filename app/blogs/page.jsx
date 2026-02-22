'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import Topbar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { blogPosts, getAllCategories } from '@/lib/blogData';
import { useSplitType } from '@/lib/hooks/useSplitType';
import '@/styles/blogPage.scss';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const headerRef = useSplitType('.blog-page-header h1', { delay: 0.2, stagger: 0.05, duration: 0.6 });
  
  const categories = ['All', ...getAllCategories()];
  
  const filteredBlogs = blogPosts.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <>
      <Topbar />
      <Navbar />
      <Breadcrumbs items={[{ label: 'Blogs' }]} />
      
      <div className="blog-page" ref={headerRef}>
        <motion.div 
          className="blog-page-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Our Blogs</h1>
          <p>Expert tips, guides, and inspiration for plant lovers</p>
        </motion.div>

        <motion.div 
          className="blog-filters"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="category-filters">
            {categories.map((category, idx) => (
              <motion.button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="blog-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog, idx) => (
              <motion.article 
                key={blog.id} 
                className="blog-card"
                variants={itemVariants}
                custom={idx}
              >
                <Link href={`/blogs/${blog.slug}`} className="blog-image-wrapper">
                  <Image 
                    src={blog.image}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="blog-image"
                  />
                  <div className="blog-category">{blog.category}</div>
                  <div className="blog-date-bookmark">
                    <span className="bookmark-month">{new Date(blog.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="bookmark-day">{new Date(blog.date).getDate()}</span>
                  </div>
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

                  <Link href={`/blogs/${blog.slug}`}>
                    <h2 className="blog-title">{blog.title}</h2>
                  </Link>

                  <p className="blog-excerpt">{blog.excerpt}</p>

                  <div className="blog-footer">
                    <div className="author">
                      <User size={16} />
                      <span>{blog.author}</span>
                    </div>
                    <Link href={`/blogs/${blog.slug}`} className="read-more">
                      Read More
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.div 
              className="no-results"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p>No articles found matching your criteria.</p>
              <button onClick={() => { setSelectedCategory('All'); }}>
                Clear Filters
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
