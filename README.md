# Vriksh Valley

Storefront for Vriksh Valley, a plant and planter nursery.
**Orders are currently placed over WhatsApp only.** Online checkout (Razorpay and Delhivery) is built but its buttons are hidden until the client approves online payments.

## Stack

- Next.js 16 (App Router, Turbopack), React 19
- SCSS (Sass modules, `@use`) with brand tokens in `styles/_variables.scss`, exported as CSS variables (`--vv-green-900`, `--vv-green-700`, `--vv-leaf`, `--vv-cream`, `--vv-sun`)
- Redux Toolkit (cart), Firebase Auth and Firestore, framer-motion, Lenis, Swiper
- Razorpay (payments) and Delhivery (shipping), server-side only, currently dormant
- Fonts through `next/font`: Bricolage Grotesque (headings and UI), Source Sans 3 (body), Italianno (accents). Helvetica is self-hosted from `public/fonts`.

## Brand palette

| Token | Value | Use |
|---|---|---|
| `--vv-green-900` | `#073b22` | Primary backgrounds, text on light |
| `--vv-green-700` | `#1a5c3a` | Secondary backgrounds |
| `--vv-leaf` | `#399663` | Highlights |
| `--vv-cream` | `#f9f5f1` | Text on dark, light surfaces |
| `--vv-sun` | `#fbbf24` | Sparingly: badges and ticks |

Add new colours to `_variables.scss`, not to component files.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` (API_KEY, AUTH_DOMAIN, PROJECT_ID, DATABASE_URL, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID) | Firebase client. `PROJECT_ID` is also used to verify ID tokens on the server |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay |
| `DELHIVERY_API_KEY`, `DELHIVERY_BASE_URL`, `DELHIVERY_CLIENT_NAME`, `DELHIVERY_PICKUP_LOCATION`, `DELHIVERY_SELLER_ADDRESS`, `DELHIVERY_SELLER_PHONE` | Delhivery shipping |
| `DELHIVERY_WEBHOOK_SECRET` | Required. The Delhivery webhook rejects every request without it. Send it as an HMAC-SHA256 hex signature of the raw body in `x-delhivery-signature`, or as the token in `x-webhook-token` |
| `NEXT_PUBLIC_SELLER_PINCODE`, `NEXT_PUBLIC_SITE_URL` | Shipping origin and canonical URL |
| `SMTP_*`, `FROM_EMAIL`, `FROM_NAME` | Order emails |
| `MSG91_*` | SMS, WhatsApp and email via MSG91 |

## Structure

```
app/            Routes, layouts and API routes (app/api/*)
components/     Homepage/, general/, cart/, products/, profile/, orders/
lib/            Services (Firestore, Razorpay, Delhivery), Redux slices, helpers
styles/         SCSS, one file per component or page
public/         Static assets (keep individual files small; prefer WebP)
```

Notable files:

- `components/Homepage/LivingShelfHero.jsx` is the hero. Its plants are configured in `lib/heroPlants.js`. Add a transparent WebP to `public/hero/` and set `image` to replace a placeholder.
- `components/general/Reveal.jsx` is the scroll-reveal wrapper that lets `app/page.jsx` stay a server component.
- `lib/serverAuth.js` verifies Firebase ID tokens for API routes. Client calls use `lib/authFetch.js`.
- `lib/servicePrices.js` holds server-trusted prices for non-catalogue services (Plant Doctor).

## Ordering and checkout

- Visible ordering paths (product page, cart page, cart drawer) open a pre-filled WhatsApp message to the shop number.
- `/checkout`, `/sample-order` and the payment and shipping API routes still exist. To turn online ordering back on, restore a checkout button in `app/cart/page.jsx`, `components/cart/CartModal.jsx` and `components/products/ProductPage.jsx`.
- `POST /api/payment/create-order` prices the cart on the server. The browser sends product ids and quantities, never the amount.
- Shipping cancel, return, NDR and create-order routes, and the order-confirmation email route, require a signed-in Firebase user.

## Performance notes

- The homepage is a server component. Only interactive sections are client components.
- The intro splash plays once per browser session and uses no video.
- Keep CSS background images small and in WebP: they bypass Next's image optimiser.
- `images.qualities` is limited to 75 and 85.

## Deployment

Deploys to Vercel. Set the environment variables above in the project settings.
