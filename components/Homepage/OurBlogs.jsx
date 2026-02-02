'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from '@/components/general/ImgWithLoader';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import { getRecentBlogs } from '@/lib/blogData';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '@/styles/ourBlogs.scss';

export default function OurBlogs() {
  const recentBlogs = getRecentBlogs(3);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <p className="cursive-subtitle">Plant Stories</p>
          <AnimatedText
            as="h1"
            text="Our Blogs"
            className="section-title"
            delay={0.1}
            stagger={0.05}
          />
          <AnimatedText
            as="p"
            text="Explore expert tips, guides, and stories from the world of plants"
            className="section-subtitle"
            delay={0.2}
            stagger={0.02}
          />
        </motion.div>

        {isMobile ? (
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1}
            className="blogs-swiper"
          >
            {recentBlogs.map((blog, index) => (
              <SwiperSlide key={blog.id}>
                <motion.article 
                  className="blog-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blogs/${blog.slug}`} className="blog-image-wrapper">
                    <Image 
                      src={blog.image}
                      alt={blog.title}
                      width={400}
                      height={250}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="blog-image"
                      priority={index === 0}
                    />
                    <div className="blog-date-badge">
                      {new Date(blog.date).toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
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

                    <Link href={`/blogs/${blog.slug}`}>
                      <h3 className="blog-title">{blog.title}</h3>
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
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
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
                <Link href={`/blogs/${blog.slug}`} className="blog-image-wrapper">
                  <Image 
                    src={blog.image}
                    alt={blog.title}
                    width={400}
                    height={250}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="blog-image"
                    priority={index === 0}
                  />
                  <div className="blog-date-badge">
                    {new Date(blog.date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
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

                  <Link href={`/blogs/${blog.slug}`}>
                    <h3 className="blog-title">{blog.title}</h3>
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
            ))}
          </div>
        )}

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
