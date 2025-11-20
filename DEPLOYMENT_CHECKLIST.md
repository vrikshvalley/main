# Vriksh Valley - Production Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup ✓

- [ ] Run Supabase migration: `supabase/migrations/001_create_orders_table.sql`
- [ ] Verify `orders` table created successfully
- [ ] Verify `profiles` table exists
- [ ] Check Row Level Security (RLS) policies enabled
- [ ] Test database queries in Supabase SQL editor
- [ ] Backup existing database (if any)

### 2. Environment Variables Setup ✓

**Copy `.env.example` to `.env.local` and configure:**

#### Supabase

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Get from Supabase project settings
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Get from Supabase project settings

#### PhonePe (Payment Gateway)

- [ ] `NEXT_PUBLIC_PHONEPE_CLIENT_ID` - **Use PRODUCTION credentials**
- [ ] `PHONEPE_CLIENT_SECRET` - **Use PRODUCTION secret**
- [ ] `PHONEPE_CLIENT_VERSION` - Version from PhonePe dashboard
- [ ] `PHONEPE_MERCHANT_ID` - Merchant ID from PhonePe dashboard
- [ ] `NEXT_PUBLIC_PHONEPE_BASE_URL` - https://api.phonepe.com/apis/pg (production)
- [ ] `PHONEPE_AUTH_URL` - https://api.phonepe.com/identity-manager/v1/oauth/token (production)
- [ ] Switch from sandbox to production mode in PhonePe dashboard
- [ ] Configure callback URLs in PhonePe dashboard
- [ ] Test payment with real UPI/Card (small amount)

#### Shiprocket (Shipping)

- [ ] `NEXT_PUBLIC_SHIPROCKET_BASE_URL` - https://apiv2.shiprocket.in
- [ ] `SHIPROCKET_EMAIL` - Your Shiprocket account email
- [ ] `SHIPROCKET_PASSWORD` - Your Shiprocket password
- [ ] `SHIPROCKET_COURIER_ID` - Preferred courier partner ID
- [ ] Complete seller verification in Shiprocket
- [ ] Add pickup addresses
- [ ] Test order creation
- [ ] Verify courier assignment works

#### Google Workspace Email (SMTP)

- [ ] `SMTP_HOST` - smtp.gmail.com
- [ ] `SMTP_PORT` - 587
- [ ] `SMTP_USER` - Your email@yourdomain.com
- [ ] `SMTP_PASSWORD` - App-specific password (16 characters)
- [ ] `FROM_EMAIL` - noreply@vrikshvalley.com (or your domain)
- [ ] `FROM_NAME` - Vriksh Valley
- [ ] Send test email to verify SMTP working
- [ ] Check spam folder for test emails

#### Next.js

- [ ] `NEXT_PUBLIC_APP_URL` - https://vrikshvalley.com (production URL)
- [ ] `NODE_ENV` - production

### 3. Dependencies Check ✓

- [ ] Run `npm install` to ensure all packages installed
- [ ] Verify installed:
  - [ ] `@supabase/auth-helpers-nextjs@^0.10.0`
  - [ ] `nodemailer@^6.9.8`
  - [ ] `axios@^1.12.2`
  - [ ] `@types/nodemailer@^6.4.14`
- [ ] Run `npm audit` and fix critical vulnerabilities
- [ ] Update package.json if needed

### 4. Code Review ✓

- [ ] All service modules created:
  - [ ] `lib/services/orderService.js`
  - [ ] `lib/services/phonepeService.js`
  - [ ] `lib/services/shiprocketService.js`
  - [ ] `lib/services/emailService.js`
  - [ ] `lib/services/userService.js`
- [ ] API routes created:
  - [ ] `app/api/payment/create-order/route.js`
  - [ ] `app/api/payment/verify/route.js`
  - [ ] `app/api/shipping/create-order/route.js`
  - [ ] `app/api/email/order-confirmation/route.js`
- [ ] Pages created:
  - [ ] `app/checkout/page.jsx`
  - [ ] `app/orders/page.jsx`
  - [ ] `app/orders/[orderId]/page.jsx`
- [ ] Components updated:
  - [ ] `components/profile/OrderHistory.jsx`
  - [ ] `components/general/WishlistButton.jsx` (if using)
- [ ] Styles created:
  - [ ] `styles/orders.scss`
  - [ ] `styles/checkout.scss`

### 5. Integration Testing ✓

#### Payment Flow

- [ ] Test PhonePe order creation
- [ ] Test redirect to PhonePe payment page
- [ ] Test payment completion (UPI, Card, Net Banking)
- [ ] Test payment status verification after redirect
- [ ] Test localStorage context preservation
- [ ] Test failed payment handling
- [ ] Test payment cancellation

#### Order Flow

- [ ] Add items to cart
- [ ] Navigate to checkout
- [ ] Select/add delivery address
- [ ] Complete payment with PhonePe (redirect flow)
- [ ] Verify redirect back to site after payment
- [ ] Verify order created in Supabase
- [ ] Verify order appears in `/orders`
- [ ] Verify order details page works

#### Shipping Flow

- [ ] Verify Shiprocket order creation
- [ ] Verify courier assignment
- [ ] Verify AWB code generated
- [ ] Test order tracking
- [ ] Test shipment cancellation

#### Email Flow

- [ ] Test order confirmation email sent
- [ ] Test shipping confirmation email
- [ ] Test delivery notification email
- [ ] Test cancellation email
- [ ] Verify all emails have correct branding
- [ ] Check email deliverability (not in spam)

#### Order Management

- [ ] Test order listing with filters
- [ ] Test order details view
- [ ] Test order cancellation
- [ ] Test return request
- [ ] Test tracking timeline display

## Vercel Deployment

### 1. Prepare for Deployment

- [ ] Push all code to GitHub repository
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Verify `.env.example` is committed (without actual values)
- [ ] Create production branch (optional)

### 2. Vercel Project Setup

- [ ] Create new project in Vercel dashboard
- [ ] Import from GitHub repository
- [ ] Select root directory
- [ ] Choose Next.js framework preset

### 3. Configure Environment Variables in Vercel

**Go to Project Settings → Environment Variables and add ALL:**

#### Supabase

```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

#### Razorpay

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx (LIVE KEY!)
RAZORPAY_KEY_SECRET=xxx (LIVE SECRET!)
```

#### Shiprocket

```
NEXT_PUBLIC_SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_COURIER_ID=your_courier_id
```

#### Email

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@vrikshvalley.com
FROM_NAME=Vriksh Valley
```

#### Next.js

```
NEXT_PUBLIC_APP_URL=https://vrikshvalley.com
NODE_ENV=production
```

### 4. Deploy

- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Check build logs for errors
- [ ] Verify deployment URL works

### 5. Domain Configuration

- [ ] Add custom domain in Vercel
- [ ] Configure DNS records:
  - A record: @ → Vercel IP
  - CNAME: www → cname.vercel-dns.com
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify SSL certificate issued
- [ ] Test site on custom domain

## Post-Deployment Testing

### 1. Full E2E Test on Production

- [ ] Visit https://vrikshvalley.com
- [ ] Browse products
- [ ] Add items to cart
- [ ] Complete checkout with real payment (test with small amount)
- [ ] Verify order created
- [ ] Check email received
- [ ] Check Shiprocket order created
- [ ] Test order tracking

### 2. Payment Gateway Verification

- [ ] Verify Razorpay dashboard shows live transactions
- [ ] Test multiple payment methods:
  - [ ] Credit card
  - [ ] Debit card
  - [ ] UPI
  - [ ] Net banking
  - [ ] Wallets
- [ ] Test payment failure scenarios
- [ ] Verify refunds work (if applicable)

### 3. Shipping Integration Verification

- [ ] Place real order
- [ ] Verify shipment created in Shiprocket dashboard
- [ ] Verify courier assigned
- [ ] Verify AWB code generated
- [ ] Track shipment
- [ ] Test shipment cancellation (if needed)

### 4. Email Deliverability

- [ ] Verify order confirmation emails delivered
- [ ] Check emails not in spam folder
- [ ] Test with multiple email providers:
  - [ ] Gmail
  - [ ] Outlook
  - [ ] Yahoo
  - [ ] Custom domain
- [ ] Verify email formatting on mobile
- [ ] Verify plain text fallback works

### 5. Mobile Testing

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test checkout flow on mobile
- [ ] Test Razorpay modal on mobile
- [ ] Test order management on mobile
- [ ] Verify responsive design

### 6. Performance Testing

- [ ] Check page load times (< 3 seconds)
- [ ] Test with slow 3G connection
- [ ] Verify images optimized
- [ ] Check Core Web Vitals in Vercel Analytics
- [ ] Test concurrent orders (if possible)

## Monitoring & Maintenance

### 1. Setup Monitoring

- [ ] Enable Vercel Analytics
- [ ] Setup Sentry for error tracking (optional)
- [ ] Monitor Razorpay dashboard for payments
- [ ] Monitor Shiprocket dashboard for shipments
- [ ] Check Supabase database usage
- [ ] Setup uptime monitoring (e.g., UptimeRobot)

### 2. Regular Checks

**Daily:**

- [ ] Check for new orders in Supabase
- [ ] Verify email delivery working
- [ ] Check Razorpay transactions
- [ ] Monitor Shiprocket shipments

**Weekly:**

- [ ] Review error logs in Vercel
- [ ] Check payment success rate
- [ ] Review shipping delays
- [ ] Check email bounce rate
- [ ] Review customer feedback

**Monthly:**

- [ ] Update dependencies (`npm update`)
- [ ] Review and fix security vulnerabilities
- [ ] Check Razorpay/Shiprocket API changes
- [ ] Optimize database queries
- [ ] Review and clear old logs

### 3. Backup Strategy

- [ ] Enable Supabase daily backups
- [ ] Export orders table weekly (CSV)
- [ ] Backup environment variables securely
- [ ] Document any custom configurations
- [ ] Keep codebase in GitHub (with tags/releases)

## Troubleshooting Common Issues

### Payment Not Working

1. Check Razorpay keys (test vs live)
2. Verify webhook URL configured
3. Check browser console for errors
4. Test payment signature verification
5. Check Razorpay dashboard for declined transactions

### Shiprocket Order Creation Failing

1. Verify API credentials
2. Check token expiry and refresh
3. Validate all required fields (address, pincode, items)
4. Check courier serviceability for delivery pincode
5. Review Shiprocket dashboard for errors

### Emails Not Sending

1. Verify SMTP credentials
2. Check app password (not regular password)
3. Test SMTP connection with telnet
4. Check email service logs
5. Verify FROM_EMAIL domain not blacklisted

### Orders Not Showing

1. Check user authentication
2. Verify RLS policies in Supabase
3. Check orders table has data
4. Review browser console for API errors
5. Check Vercel function logs

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables not exposed
- [ ] Razorpay signature verification working
- [ ] Supabase RLS policies enabled
- [ ] API routes validate authentication
- [ ] No sensitive data in client-side code
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Supabase handles)
- [ ] XSS protection (React handles)
- [ ] Rate limiting on API routes (optional)

## Launch Checklist

### Final Steps Before Going Live

- [ ] All environment variables configured
- [ ] Database migration applied
- [ ] All integrations tested (payment, shipping, email)
- [ ] Full checkout flow tested end-to-end
- [ ] Order management tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Domain configured and SSL enabled
- [ ] Team trained on order management
- [ ] Support email configured
- [ ] Terms & Privacy Policy updated
- [ ] Refund policy documented
- [ ] Shipping policy documented

### Go Live!

- [ ] Switch Razorpay to live mode
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Deploy to Vercel
- [ ] Test with real order (small amount)
- [ ] Monitor for first few hours
- [ ] Announce launch 🎉

## Post-Launch

- [ ] Monitor orders and transactions
- [ ] Respond to customer inquiries
- [ ] Track shipping updates
- [ ] Process refunds if needed
- [ ] Collect customer feedback
- [ ] Iterate and improve

---

## Support Contacts

- **Razorpay Support:** https://razorpay.com/support/
- **Shiprocket Support:** https://support.shiprocket.in/
- **Supabase Support:** https://supabase.com/support
- **Vercel Support:** https://vercel.com/support

## Documentation Links

- **Razorpay Docs:** https://razorpay.com/docs/
- **Shiprocket API:** https://apidocs.shiprocket.in/
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Nodemailer Docs:** https://nodemailer.com/

---

**Last Updated:** 2024
**Version:** 1.0.0
