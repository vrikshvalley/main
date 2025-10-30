'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, Search, ArrowRight } from 'lucide-react';
import TopBar from '@/components/general/Topbar';
import Navbar from '@/components/general/Navbar';
import Footer from '@/components/general/Footer';
import WhatsAppButton from '@/components/general/WhatsAppButton';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { blogPosts, getAllCategories } from '@/lib/blogData';
import '@/styles/blogPage.scss';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', ...getAllCategories()];
  
  const filteredBlogs = blogPosts.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <TopBar />
      <Navbar />
      <Breadcrumbs items={[{ label: 'Blog' }]} />
      
      <div className="blog-page">
        <div className="blog-page-header">
          <h1>Our Blog</h1>
          <p>Expert tips, guides, and inspiration for plant lovers</p>
        </div>

        <div className="blog-filters">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="blog-grid">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map(blog => (
              <article key={blog.id} className="blog-card">
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
                    <h2 className="blog-title">{blog.title}</h2>
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
              </article>
            ))
          ) : (
            <div className="no-results">
              <p>No articles found matching your criteria.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
