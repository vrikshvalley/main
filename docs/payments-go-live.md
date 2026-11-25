# Online payments and shipping: go-live checklist

Direct payment is built but switched off. Until it is switched on, the site shows "coming soon" and orders go through WhatsApp. Shipping is always free: product prices include delivery, so nothing is added at checkout.

## How an order flows

1. **Checkout** (`/checkout`): the customer enters an email and a delivery address. The pincode is checked live with Delhivery, which also fills in the city.
2. **`POST /api/payment/create-order`**: the server prices the cart from Firestore, applying offers and checking stock. It then saves an order with status `pending_payment` and creates the matching Razorpay order. The browser never sends an amount.
3. **Razorpay Checkout** opens. The customer pays by UPI, card, net banking or wallet.
4. **`POST /api/payment/verify`**: the server checks the payment before marking the order paid:
   - it verifies the HMAC signature;
   - it fetches the payment from Razorpay and checks the order id, the exact amount, the currency and that the status is `captured`.

   It then marks the order `paid` and reduces stock, exactly once, in a single transaction.
5. **Fulfilment**: the server books the Delhivery shipment (prepaid, with the waybill saved on the order) and emails the confirmation. If the shipment fails, the payment is still kept, and the order shows `shipment_status: "failed"` for the team to retry.
6. **`POST /api/webhooks/razorpay`**: the safety net. If a customer pays and closes the tab, the webhook still confirms and fulfils the order. Duplicate events are harmless.
7. **`POST /api/webhooks/delhivery`**: moves the order to `shipped` and then `delivered` as the courier scans the parcel.

Customers can cancel before dispatch, which refunds in full and cancels the shipment automatically. They can request a return after delivery.

## Guests, accounts and carts

Nobody has to log in to buy.

- **Checkout asks for** an email, mobile number and address. There is no login or password step.
- **After the payment is verified**, the server matches the email to a Firebase Auth user, or creates one. It attaches the order to that user (`orders.user_id`) and saves the profile and address in `profiles/{uid}`. This runs inside order fulfilment, so it is retried automatically along with the shipment and email.
  - Accounts are created only after a paid order, never on an open request, so the public checkout endpoint cannot be used to mass-create users.
  - The buyer is not signed in automatically. The email was typed, not proven, so an automatic sign-in would let anyone take over an account by typing its address.
- **Signing in later:** with Google or an email link on the same address, the customer lands in the same account (same uid) and sees their orders and saved address.
  - This needs **Firebase console > Authentication > Settings > User account linking > "Link accounts that use the same email"**.
  - The Email link and Google sign-in methods must both be enabled, and your domain must be an authorised domain.
- **Cart:**
  - Guests keep their cart in the browser (localStorage). On sign-in it is merged once into the account's saved cart (`carts/{uid}`), with quantities added.
  - Signed-in changes are saved automatically. Prices, names and offers are re-read from the catalogue each time the cart loads.
  - After a paid order the cart is cleared. Signing out empties the screen, but the account keeps its saved cart.
- **Known limit:** because the email is not verified at checkout, someone can pay for an order using another person's email. It then appears in that person's order history after they sign in. They have not been charged, but you may want to say so in support.

## Before switching on

- [ ] **Firebase Admin key** (works on the free Spark plan): Firebase console > Project settings > Service accounts > Generate new private key. Put it in `FIREBASE_SERVICE_ACCOUNT_BASE64` (base64 of the JSON file).
- [ ] **Firebase Authentication:** "Link accounts that use the same email" is selected, and the Email link and Google providers are enabled (see above).
- [ ] **Deploy `firestore.rules`**: `firebase deploy --only firestore:rules`, or paste them into the console. This stops browsers writing orders.
- [ ] **Staff access:**
  - Set `ADMIN_EMAILS=owner@…` and/or the custom claim `{ admin: true }` on staff accounts.
  - The product admin screens write to `products` from the browser, so staff need the `admin` claim once the rules are live.
- [ ] **Razorpay test mode:**
  - Set `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the same `rzp_test_…` value, and set `RAZORPAY_KEY_SECRET`.
  - Add a webhook at `https://<domain>/api/webhooks/razorpay` with a secret in `RAZORPAY_WEBHOOK_SECRET`. Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
- [ ] **Delhivery:**
  - Set `DELHIVERY_API_KEY`, `DELHIVERY_BASE_URL` (`https://staging-express.dlv.in` for testing) and `DELHIVERY_PICKUP_LOCATION`. The pickup location must exactly match the warehouse name registered with Delhivery.
  - Also set `NEXT_PUBLIC_SELLER_PINCODE` and the seller address and phone.
  - Register `https://<domain>/api/webhooks/delhivery` with `DELHIVERY_WEBHOOK_SECRET`.
- [ ] **Email:** set the SMTP settings, so confirmations send.
- [ ] **Optional:** add `weightGrams` to products for accurate shipping weights. The default is 500 g per item plus 200 g of packaging.
- [ ] Set `NEXT_PUBLIC_ONLINE_PAYMENTS=true`, rebuild and redeploy.

## Test in Razorpay test mode

- [ ] A successful card or UPI test payment leads to an order that is `confirmed` and `paid`. Stock goes down, a waybill appears and the email arrives.
- [ ] Close the tab right after paying. The webhook still confirms the order within a minute.
- [ ] A failed test payment leaves the order unpaid, and the customer can retry.
- [ ] Cancelling from "My Orders" refunds the payment, and the `refund.processed` webhook sets the order to `refunded`.
- [ ] A non-serviceable pincode is blocked at checkout.
- [ ] **Guest checkout:**
  - Pay while signed out, using a new email. The order is confirmed, and an Auth user and `profiles/{uid}` appear.
  - Sign in with Google using that email. It is the same uid, and the order and saved address are there.
  - Repeat with an email link instead of Google.
  - Pay again with the same email while signed out. The order attaches to the same account and no second account is created.
- [ ] **Cart merge:** add items signed out, sign in, and the items join the account's cart (quantities added, once, not doubled after a reload). Sign out, and the cart screen is empty.
- [ ] Plant Doctor: a paid booking is confirmed with its date and time on the order.

Then switch to live keys (`rzp_live_…`) and the live Delhivery host, and run one real ₹1 order end to end.

## Stock holds, slots and alerts

- When a customer starts paying, their cart units are held for 15 minutes (`reservations`), so two people cannot pay for the last unit. A consultation slot is held the same way (`plantDoctorSlots`), one booking per slot. Holds expire by themselves.
- Deploy `firestore.indexes.json` (`firebase deploy --only firestore:indexes`). Until the `reservations` index is built, holds are skipped (checkout still works) and the paid-order step flags any oversell.
- Every paid order or booking emails `ORDER_ALERT_EMAILS` (falls back to `ADMIN_EMAILS`). Anything odd (oversold, double-booked slot, failed shipment) is marked "Needs attention".

## Admin site (admin.vrikshvalley.com)

- It is the same codebase: `proxy.js` serves `/admin` only on hosts starting with `admin.`; on the shop domain `/admin` is a 404. Add `admin.vrikshvalley.com` as a domain on the hosting project, and in Firebase console > Authentication > Settings > Authorised domains.
- Locally: open `http://admin.localhost:3000`.
- Sign in with Google using an email in `ADMIN_EMAILS` (or with the `admin` claim). The `/api/admin/*` routes check this on the server.
- Orders list with filters (needs attention, shipment failed, Plant Doctor, returns), and per-order actions: retry shipment, resend email, cancel and refund, mark handled, add note.

## Hosting notes

- **Vercel Hobby** is limited to non-commercial use. A live store should be on Vercel Pro (or another paid host).
- **Cloudflare:** `firebase-admin`, `nodemailer` (SMTP) and the Razorpay SDK need Node APIs that Workers do not fully support. Moving there needs fetch-based replacements (and an HTTP email API instead of SMTP). Stay on Vercel until that is done and tested.
- Rate limits are per server instance; add Cloudflare/Vercel firewall rules for `/api/payment/*` and `/api/orders/lookup` if you see abuse.

## Useful staff endpoints

These need a signed-in staff user.

- `POST /api/shipping/create-order { orderId }`: retry a failed shipment.
- `POST /api/email/order-confirmation { orderId }`: resend the confirmation.
- `POST /api/shipping/returns`, `/api/shipping/cancel`, `/api/shipping/ndr`: courier actions.

Run `npm test` for the payment, pricing and Delhivery unit tests.
