# Vriksh Valley - Premium Online Plant Nursery

A modern e-commerce platform for **Vriksh Valley**, offering premium indoor and outdoor plants, succulents, bonsai, and eco-friendly gardening products. Built with Next.js 14 and optimized for performance and SEO.

## 🌱 About Vriksh Valley

Vriksh Valley is an online plant nursery dedicated to bringing nature closer to homes and offices. We offer a curated collection of healthy plants with expert care guidance, sustainable packaging, and reliable delivery across India.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **State Management:** Redux Toolkit for cart and user state
- **Authentication:** Supabase Auth with OAuth support
- **Database:** Supabase (PostgreSQL)
- **Payment Gateway:** PhonePe
- **Shipping:** Shiprocket API integration
- **Email:** Nodemailer with Google Workspace SMTP
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
├── slices/                # Redux slices (cart, user)
└── services/              # Backend service integrations
    ├── shiprocketService.js    # Shiprocket API wrapper
    ├── phonepeService.js       # PhonePe payment service
    ├── emailService.js         # Email notifications
    ├── orderService.js         # Order management
    └── userService.js          # User profile operations

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

## 🌿 Environment Variables

Copy `.env.example` to `.env.local` and configure all required variables:

### Required Variables

```env
# Next.js
NEXT_PUBLIC_APP_URL=https://vrikshvalley.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PhonePe (https://developer.phonepe.com/)
NEXT_PUBLIC_PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=your_client_version
NEXT_PUBLIC_PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_AUTH_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token
PHONEPE_MERCHANT_ID=your_merchant_id

# Shiprocket (https://app.shiprocket.in/seller/setting/api)
NEXT_PUBLIC_SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_COURIER_ID=your_preferred_courier_id

# Google Workspace Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASSWORD=your_app_specific_password
FROM_EMAIL=noreply@vrikshvalley.com
FROM_NAME=Vriksh Valley
```

## 📦 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd vriksh-valley
npm install
```

### 2. Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the orders table migration:
   - Open Supabase SQL Editor
   - Execute `supabase/migrations/001_create_orders_table.sql`
3. Verify the `profiles` table exists for user data
4. Copy your Supabase URL and anon key to `.env.local`

### 3. Payment Gateway Setup (PhonePe)

1. Sign up at [PhonePe Developer Portal](https://developer.phonepe.com/)
2. Complete merchant onboarding
3. Navigate to **Dashboard → Credentials**
4. Get your API credentials:
   - Client ID
   - Client Secret
   - Client Version
   - Merchant ID
5. Use **Sandbox** environment for testing
6. Add credentials to `.env.local`:
   ```
   NEXT_PUBLIC_PHONEPE_CLIENT_ID=your_client_id
   PHONEPE_CLIENT_SECRET=your_client_secret
   PHONEPE_CLIENT_VERSION=your_client_version
   NEXT_PUBLIC_PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
   PHONEPE_AUTH_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token
   PHONEPE_MERCHANT_ID=your_merchant_id
   ```
7. For production, switch to production URLs and credentials

### 4. Shipping Integration Setup (Shiprocket)

1. Create account at [Shiprocket](https://www.shiprocket.in/)
2. Complete seller verification
3. Add pickup addresses in Shiprocket dashboard
4. Get API credentials:
   - Email: Your Shiprocket login email
   - Password: Your Shiprocket password
5. Get preferred courier ID:
   - Test with `checkServiceability` API
   - Or check Shiprocket dashboard for courier partners
6. Add credentials to `.env.local`

### 5. Email Service Setup (Google Workspace SMTP)

1. **For Google Workspace Users:**
   - Go to [Google Admin Console](https://admin.google.com)
   - Enable **Less secure app access** (or use OAuth2)
2. **Create App Password:**

   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Generate and copy the 16-character password

3. **Add to `.env.local`:**

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@yourdomain.com
   SMTP_PASSWORD=your-16-char-app-password
   FROM_EMAIL=noreply@vrikshvalley.com
   FROM_NAME=Vriksh Valley
   ```

4. **Alternative: Gmail with App Password**
   - Works the same way as Google Workspace
   - Use your Gmail address as SMTP_USER

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## 🧪 Testing the Order Flow

### Complete Checkout Test:

1. **Add products to cart** from `/products`
2. **Go to checkout** at `/checkout`
3. **Step 1: Address**
   - Add or select delivery address
   - Validate pincode (6 digits)
4. **Step 2: Payment**
   - Review order summary
   - Click "Proceed to Payment"
   - Redirected to PhonePe payment page
   - Complete payment using PhonePe (UPI/Card/Net Banking)
   - Redirected back to confirmation page
5. **Step 3: Confirmation**
   - Order created in Supabase
   - Shiprocket order created
   - Confirmation email sent
   - View order at `/orders`

### PhonePe Testing:

- In **Sandbox mode**, use PhonePe test credentials provided in the developer dashboard
- Test different payment modes: UPI, Card, Net Banking
- Verify payment callback handling
- Test payment failures and cancellations

### Order Management Test:

1. **View all orders:** `/orders`
2. **Filter orders** by status (Pending, Shipped, Delivered, Cancelled)
3. **View order details:** Click on any order
4. **Track shipment:** See real-time tracking timeline
5. **Cancel order:** Available for Pending/Confirmed orders
6. **Request return:** Available for Delivered orders

## 📧 Email Templates

The system sends 4 types of emails:

1. **Order Confirmation** - Sent after successful payment
2. **Shipping Confirmation** - Sent when order is shipped (includes AWB tracking)
3. **Delivery Notification** - Sent when order is delivered
4. **Cancellation Confirmation** - Sent when order is cancelled

All emails use beautiful HTML templates with Vriksh Valley branding and include plain text fallbacks.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy

### Important: Production Checklist

- ✅ Switch PhonePe to **Production** credentials and URLs
- ✅ Update `NEXT_PUBLIC_APP_URL` to production domain
- ✅ Verify Supabase RLS policies are enabled
- ✅ Test email delivery in production
- ✅ Configure Shiprocket pickup addresses
- ✅ Configure PhonePe webhook URLs for payment notifications
- ✅ Enable Shiprocket auto-courier assignment
- ✅ Test complete order flow end-to-end

## 📞 Support

For technical support or inquiries:

- Website: [vrikshvalley.com](https://vrikshvalley.com)
- Email: support@vrikshvalley.com

---

**Built with 💚 by the Vriksh Valley Team**
