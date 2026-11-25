import nodemailer from "nodemailer";

/**
 * Email Service using Google Workspace (Gmail)
 * Sends order confirmation, tracking updates, and promotional emails
 */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER; // Your Google Workspace email
const SMTP_PASSWORD = process.env.SMTP_PASSWORD; // App-specific password
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.FROM_NAME || "Vriksh Valley";

let transporter = null;

/**
 * Initialize email transporter
 * Uses Google Workspace SMTP with OAuth2 or App Password
 */
function getTransporter() {
  if (!SMTP_USER || !SMTP_PASSWORD) throw new Error("Email is not configured (SMTP_USER / SMTP_PASSWORD)");
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for port 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      // Certificate checks stay ON in production (turning them off allows interception).
      ...(process.env.NODE_ENV !== "production" ? { tls: { rejectUnauthorized: false } } : {}),
    });
  }
  return transporter;
}

/**
 * Send order confirmation email
 * @param {Object} orderData - Order details
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<Object>} Email send response
 */
export async function sendOrderConfirmation(orderData, customerEmail) {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Confirmation - ${orderData.orderId}`,
      html: generateOrderConfirmationHTML(orderData),
      text: generateOrderConfirmationText(orderData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent:", info.messageId);

    return { data: info, error: null };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to send email" },
    };
  }
}

/**
 * Internal alert to the store team (new paid order / booking / needs attention).
 * Recipients: ORDER_ALERT_EMAILS, else ADMIN_EMAILS, else the SMTP mailbox itself.
 */
export async function sendOwnerAlert({ subject, text, html }) {
  try {
    const to = (process.env.ORDER_ALERT_EMAILS || process.env.ADMIN_EMAILS || SMTP_USER || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (to.length === 0) throw new Error("No alert recipient configured (ORDER_ALERT_EMAILS)");
    const info = await getTransporter().sendMail({ from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to, subject, text, html });
    return { data: info, error: null };
  } catch (error) {
    console.error("Owner alert email error:", error.message);
    return { data: null, error: { message: error.message || "Failed to send alert" } };
  }
}

/**
 * Send shipping confirmation email
 * @param {Object} shippingData - Shipping and tracking details
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<Object>} Email send response
 */
export async function sendShippingConfirmation(shippingData, customerEmail) {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Your Order is Shipped - ${shippingData.orderId}`,
      html: generateShippingConfirmationHTML(shippingData),
      text: generateShippingConfirmationText(shippingData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Shipping confirmation email sent:", info.messageId);

    return { data: info, error: null };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to send email" },
    };
  }
}

/**
 * Send delivery notification email
 * @param {Object} deliveryData - Delivery details
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<Object>} Email send response
 */
export async function sendDeliveryNotification(deliveryData, customerEmail) {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Delivered - ${deliveryData.orderId}`,
      html: generateDeliveryNotificationHTML(deliveryData),
      text: generateDeliveryNotificationText(deliveryData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Delivery notification email sent:", info.messageId);

    return { data: info, error: null };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to send email" },
    };
  }
}

/**
 * Send cancellation confirmation email
 * @param {Object} cancellationData - Cancellation details
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<Object>} Email send response
 */
export async function sendCancellationConfirmation(
  cancellationData,
  customerEmail
) {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Cancelled - ${cancellationData.orderId}`,
      html: generateCancellationConfirmationHTML(cancellationData),
      text: generateCancellationConfirmationText(cancellationData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Cancellation confirmation email sent:", info.messageId);

    return { data: info, error: null };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      data: null,
      error: { message: error.message || "Failed to send email" },
    };
  }
}

// ============ HTML Email Templates ============

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://vrikshvalley.com";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "contact@vrikshvalley.com";

function addressLines(a) {
  if (!a) return [];
  return [a.name, a.line1, a.line2, a.locality, a.landmark, [a.city, a.state].filter(Boolean).join(", "), a.pincode && `PIN ${a.pincode}`]
    .filter(Boolean)
    .map(String);
}

// Customer-supplied text (names, addresses) is always escaped: it ends up in an email sent from our domain.
export function generateOrderConfirmationHTML(orderData) {
  const rows = (orderData.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.image ? `<img src="${esc(String(item.image).startsWith("/") ? `${SITE}${item.image}` : item.image)}" alt="" width="56" height="56" style="width:56px;height:56px;object-fit:cover;border-radius:8px;vertical-align:middle;margin-right:10px;" />` : ""}${esc(item.name)}${item.options ? `<br /><span style="color:#6b7280;font-size:12px;">${esc(item.options)}</span>` : ""}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${esc(item.quantity)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${rupees(item.price * item.quantity)}</td>
    </tr>`
    )
    .join("");

  const address = addressLines(orderData.shippingAddress);
  const appt = orderData.appointment;
  const apptHTML = appt
    ? `<div style="background:#ecfdf5;border-radius:10px;padding:14px 16px;margin:18px 0;">
        <strong style="color:#073b22;">Your consultation</strong><br />
        ${esc(appt.dateLabel || appt.date)} at ${esc(appt.timeLabel || appt.time)} (India time)<br />
        <span style="color:#4b5563;">Our team will WhatsApp you the video link before your slot.</span>
      </div>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#f3f4f6;font-family:Helvetica,Arial,sans-serif;color:#111827;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#073b22;color:#ffffff;padding:28px 24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;">Thank you for your order!</h1>
      <p style="margin:6px 0 0;opacity:.85;">Vriksh Valley</p>
    </div>
    <div style="padding:24px;">
      <p style="margin-top:0;">Hi <strong>${esc(orderData.customerName)}</strong>, your payment was received and your order is confirmed.</p>
      <p style="margin:4px 0;color:#6b7280;"><strong>Order ID:</strong> ${esc(orderData.orderId)}</p>
      <p style="margin:4px 0 16px;color:#6b7280;"><strong>Date:</strong> ${esc(new Date(orderData.orderDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }))}</p>
      ${apptHTML}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead><tr style="background:#f9fafb;"><th align="left" style="padding:10px;">Item</th><th style="padding:10px;">Qty</th><th align="right" style="padding:10px;">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;margin:12px 0 0;color:#6b7280;">Shipping: <strong style="color:#1a8f55;">FREE</strong></p>
      <p style="text-align:right;margin:4px 0 18px;font-size:20px;color:#073b22;"><strong>Total paid: ${rupees(orderData.total)}</strong></p>
      ${address.length ? `<h3 style="margin:18px 0 6px;color:#073b22;">Delivering to</h3><p style="margin:0;line-height:1.6;color:#374151;">${address.map(esc).join("<br />")}</p>` : ""}
      <p style="margin:24px 0 0;"><a href="${esc(SITE)}/auth/signin?redirect=/orders" style="background:#073b22;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block;">View your order</a></p>
      <p style="color:#6b7280;font-size:13px;margin-top:20px;">Sign in with this email address (Google or an email link) to track your order. Questions? Reply to this email or write to ${esc(SUPPORT_EMAIL)}.</p>
    </div>
    <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Vriksh Valley</div>
  </div>
</body></html>`;
}

function generateShippingConfirmationHTML(shippingData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f1; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #073b22 0%, #1c9e5b 100%); padding: 30px; text-align: center;">
          <img src="https://vrikshvalley.com/logo.webp" alt="Vriksh Valley" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Order is on the Way! 🚚</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${esc(shippingData.customerName)}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Great news! Your order has been shipped and is on its way to you.
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #1c9e5b; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h2 style="font-size: 18px; color: #073b22; margin: 0 0 10px 0;">Tracking Information</h2>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${esc(shippingData.orderId)}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Tracking Number:</strong> ${esc(shippingData.awbCode)}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Courier:</strong> ${esc(shippingData.courierName)}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Expected Delivery:</strong> ${esc(shippingData.expectedDelivery || shippingData.estimatedDelivery || "In transit")}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${esc(shippingData.trackingUrl)}" style="display: inline-block; background: #1c9e5b; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold;">Track Your Order</a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            If you have any questions, contact us at <a href="mailto:contact@vrikshvalley.com" style="color: #1c9e5b;">contact@vrikshvalley.com</a>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDeliveryNotificationHTML(deliveryData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f1; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #073b22 0%, #1c9e5b 100%); padding: 30px; text-align: center;">
          <img src="https://vrikshvalley.com/logo.webp" alt="Vriksh Valley" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Order Delivered! 🎉</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${esc(deliveryData.customerName)}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your order has been successfully delivered! We hope you love your plants.
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #1c9e5b; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${esc(deliveryData.orderId)}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Delivered On:</strong> ${esc(new Date(deliveryData.deliveredAt || Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">How was your experience?</p>
            <a href="https://vrikshvalley.com/orders/${esc(encodeURIComponent(deliveryData.orderId))}" style="display: inline-block; background: #1c9e5b; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold;">View Your Order</a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            Thank you for choosing Vriksh Valley! 🌱
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCancellationConfirmationHTML(cancellationData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Cancelled</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f1; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
          <img src="https://vrikshvalley.com/logo.webp" alt="Vriksh Valley" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Order Cancelled</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${esc(cancellationData.customerName)}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your order has been cancelled as requested.
          </p>

          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${esc(cancellationData.orderId)}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Cancellation Reason:</strong> ${esc(cancellationData.reason || "Customer request")}</p>
            ${
              cancellationData.refundAmount
                ? `<p style="margin: 5px 0; color: #6b7280;"><strong>Refund Amount:</strong> ₹${Number(cancellationData.refundAmount).toFixed(2)}</p>`
                : ""
            }
          </div>

          ${
            cancellationData.refundAmount
              ? `<p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your refund will be processed within 7-10 working days to your original payment method.
          </p>`
              : ""
          }

          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            We're sorry to see you cancel your order. If you have any concerns, please contact us at <a href="mailto:contact@vrikshvalley.com" style="color: #1c9e5b;">contact@vrikshvalley.com</a>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============ Plain Text Templates ============

export function generateOrderConfirmationText(orderData) {
  const items = (orderData.items || []).map((i) => `${i.name} x ${i.quantity} - ${rupees(i.price * i.quantity)}`).join("\n");
  const address = addressLines(orderData.shippingAddress).join("\n");
  const appt = orderData.appointment;
  return [
    "Thank you for your order!",
    "",
    `Hi ${orderData.customerName}, your payment was received and your order is confirmed.`,
    "",
    `Order ID: ${orderData.orderId}`,
    appt ? `Consultation: ${appt.dateLabel || appt.date} at ${appt.timeLabel || appt.time} (India time). We will WhatsApp you the video link.` : null,
    "",
    items,
    "",
    "Shipping: FREE",
    `Total paid: ${rupees(orderData.total)}`,
    address ? `\nDelivering to:\n${address}` : null,
    "",
    `Track your order: ${SITE}/auth/signin?redirect=/orders`,
    `Questions? ${SUPPORT_EMAIL}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

function generateShippingConfirmationText(shippingData) {
  return `
Your Order is on the Way!

Hi ${shippingData.customerName},

Your order has been shipped!

Tracking Information:
- Order ID: ${shippingData.orderId}
- Tracking Number: ${shippingData.awbCode}
- Courier: ${shippingData.courierName}
- Expected Delivery: ${shippingData.expectedDelivery}

Track your order: ${shippingData.trackingUrl}

© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.
  `.trim();
}

function generateDeliveryNotificationText(deliveryData) {
  return `
Order Delivered!

Hi ${deliveryData.customerName},

Your order has been successfully delivered!

Order ID: ${deliveryData.orderId}
Delivered On: ${new Date(deliveryData.deliveredAt).toLocaleString()}

Thank you for choosing Vriksh Valley! 🌱

© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.
  `.trim();
}

function generateCancellationConfirmationText(cancellationData) {
  return `
Order Cancelled

Hi ${cancellationData.customerName},

Your order has been cancelled as requested.

Order ID: ${cancellationData.orderId}
Cancellation Reason: ${cancellationData.reason || "Customer request"}
${
  cancellationData.refundAmount
    ? `Refund Amount: ₹${cancellationData.refundAmount.toFixed(2)}`
    : ""
}

${
  cancellationData.refundAmount
    ? "Your refund will be processed within 7-10 working days."
    : ""
}

For questions, contact: contact@vrikshvalley.com

© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.
  `.trim();
}

export default {
  sendOrderConfirmation,
  sendShippingConfirmation,
  sendDeliveryNotification,
  sendCancellationConfirmation,
};
