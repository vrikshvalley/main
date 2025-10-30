# Vriksh Valley - Premium Online Plant Nursery

A modern e-commerce platform for **Vriksh Valley**, offering premium indoor and outdoor plants, succulents, bonsai, and eco-friendly gardening products. Built with Next.js 14 and optimized for performance and SEO.

## 🌱 About Vriksh Valley

Vriksh Valley is an online plant nursery dedicated to bringing nature closer to homes and offices. We offer a curated collection of healthy plants with expert care guidance, sustainable packaging, and reliable delivery across India.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **State Management:** Redux Toolkit for cart and user state
- **Authentication:** Supabase Auth with OAuth support
- **Database:** Supabase (PostgreSQL)
- **Styling:** SCSS with modular components
- **Animations:** Framer Motion
- **Image Optimization:** Next.js Image component

## 🎨 Design System

### Typography

- **Headings:** Playfair Display (Serif)
- **Body Text:** Alumni Sans (Sans-serif)

### Color Palette

- **Dark Green:** `#073b22` - Primary brand color
- **Deep Green:** `#1a5c3a` - Secondary accents
- **Teal:** `#2dd4bf` - Highlights and CTAs
- **Yellow:** `#fbbf24` - Accent color for important elements

## 📁 Project Structure

```
app/
├── layout.js              # Root layout with global metadata
├── page.jsx               # Homepage with hero, featured products
├── about-us/              # About page
├── products/              # Product listing
├── contact-us/            # Contact form
├── cart/                  # Shopping cart
├── profile/               # User profile & orders
├── track-order/           # Order tracking
├── auth/                  # Login/signup pages
└── api/                   # Serverless API routes

components/
├── Homepage/              # Homepage sections (Hero, Gallery, Testimonials)
├── auth/                  # Authentication components
├── cart/                  # Cart functionality
├── products/              # Product cards and pages
└── general/               # Navbar, Footer, WhatsApp button

lib/
├── store.js               # Redux store configuration
├── supabaseClient.js      # Supabase client setup
└── slices/                # Redux slices (cart, user)

styles/
├── _variables.scss        # Global design tokens
├── globals.scss           # Base styles
└── [component].scss       # Component-specific styles
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/vrikshvalley/main.git

# Navigate to project directory
cd "vriksh valley"

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
npm start
```

## ✨ Key Features

### E-commerce

- 🛒 Redux-powered shopping cart with persistence
- 🔐 Secure authentication with Supabase
- 📦 Order tracking and management
- 💳 User profile with order history

### User Experience

- 🎭 Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🖼️ Optimized image loading and lazy loading
- ⚡ Fast page loads with Next.js optimization

### SEO & Marketing

- 🔍 Comprehensive meta tags and OpenGraph
- 🗺️ SEO-friendly URLs (slugs)
- 📊 Structured data for search engines
- 🌐 Social media sharing optimization

### Performance

- ⚡ 60 FPS smooth scrolling
- 🎨 GPU-accelerated animations
- 📦 Code splitting and lazy loading
- 🖼️ WebP image optimization

## 🌐 Pages

- **Homepage:** Hero slider, featured products, testimonials, gallery
- **Products:** Browse plants by category
- **About Us:** Mission, values, and team
- **Our Story:** Company journey and philosophy
- **Contact Us:** Get in touch for support
- **FAQs:** Common questions about plant care
- **Shipping Policies:** Delivery information
- **Track Order:** Real-time order tracking
- **Legal Pages:** Terms, conditions, return policy

## 🔧 API Routes

Serverless functions located in `app/api/`:

- `/api/hello` - Health check endpoint
- Add more API routes as needed for orders, products, etc.

## 📦 Deployment

This project is optimized for deployment on **Vercel**:

```bash
# Deploy to Vercel
vercel
```

Alternatively, deploy to any platform supporting Next.js (Netlify, Railway, etc.).

## 🤝 Contributing

This is a private project for Vriksh Valley. For internal development queries, contact the dev team.

## 📄 License

Proprietary - © 2025 Vriksh Valley. All rights reserved.

## 🌿 Environment

Make sure to configure these environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📞 Support

For technical support or inquiries:

- Website: [vrikshvalley.com](https://vrikshvalley.com)
- Email: support@vrikshvalley.com

---

**Built with 💚 by the Vriksh Valley Team**
