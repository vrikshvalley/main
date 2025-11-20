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
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for port 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in dev
      },
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

function generateOrderConfirmationHTML(orderData) {
  const itemsHTML = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <img src="${item.image}" alt="${
        item.name
      }" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${
        item.name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(
        item.price / 100
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f1; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #073b22 0%, #1c9e5b 100%); padding: 30px; text-align: center;">
          <img src="https://vrikshvalley.com/logo.png" alt="Vriksh Valley" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Order!</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${orderData.customerName}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your order has been received and is being processed. We'll send you another email once your order has been shipped.
          </p>

          <!-- Order Details -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h2 style="font-size: 18px; color: #073b22; margin: 0 0 10px 0;">Order Details</h2>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${
              orderData.orderId
            }</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order Date:</strong> ${new Date(
              orderData.orderDate
            ).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Payment Method:</strong> ${
              orderData.paymentMethod
            }</p>
          </div>

          <!-- Order Items -->
          <h3 style="font-size: 16px; color: #073b22; margin: 20px 0 10px 0;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Image</th>
                <th style="padding: 10px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Product</th>
                <th style="padding: 10px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Qty</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Total -->
          <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #073b22;">
            <p style="font-size: 20px; color: #073b22; margin: 0;"><strong>Total: ₹${(
              orderData.total / 100
            ).toFixed(2)}</strong></p>
          </div>

          <!-- Shipping Address -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="font-size: 16px; color: #073b22; margin: 0 0 10px 0;">Shipping Address</h3>
            <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
              ${orderData.shippingAddress.line1}<br />
              ${
                orderData.shippingAddress.line2
                  ? orderData.shippingAddress.line2 + "<br />"
                  : ""
              }
              ${orderData.shippingAddress.locality}, ${
    orderData.shippingAddress.city
  }<br />
              ${orderData.shippingAddress.state} - ${
    orderData.shippingAddress.pincode
  }
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If you have any questions, feel free to contact us at <a href="mailto:support@vrikshvalley.com" style="color: #1c9e5b;">support@vrikshvalley.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            © ${new Date().getFullYear()} Vriksh Valley. All rights reserved.
          </p>
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">
            Pure. Organic. Natural.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
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
          <img src="https://vrikshvalley.com/logo.png" alt="Vriksh Valley" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Order is on the Way! 🚚</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${shippingData.customerName}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Great news! Your order has been shipped and is on its way to you.
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #1c9e5b; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h2 style="font-size: 18px; color: #073b22; margin: 0 0 10px 0;">Tracking Information</h2>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${
              shippingData.orderId
            }</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Tracking Number:</strong> ${
              shippingData.awbCode
            }</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Courier:</strong> ${
              shippingData.courierName
            }</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Expected Delivery:</strong> ${
              shippingData.expectedDelivery
            }</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              shippingData.trackingUrl
            }" style="display: inline-block; background: #1c9e5b; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold;">Track Your Order</a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            If you have any questions, contact us at <a href="mailto:support@vrikshvalley.com" style="color: #1c9e5b;">support@vrikshvalley.com</a>
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
          <img src="https://vrikshvalley.com/logo.png" alt="Vriksh Valley" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Order Delivered! 🎉</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${deliveryData.customerName}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your order has been successfully delivered! We hope you love your plants.
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #1c9e5b; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${
              deliveryData.orderId
            }</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Delivered On:</strong> ${new Date(
              deliveryData.deliveredAt
            ).toLocaleString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">How was your experience?</p>
            <a href="https://vrikshvalley.com/orders/${
              deliveryData.orderId
            }/review" style="display: inline-block; background: #1c9e5b; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold;">Write a Review</a>
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
          <img src="https://vrikshvalley.com/logo.png" alt="Vriksh Valley" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Order Cancelled</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${cancellationData.customerName}</strong>,
          </p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your order has been cancelled as requested.
          </p>

          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> ${
              cancellationData.orderId
            }</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Cancellation Reason:</strong> ${
              cancellationData.reason || "Customer request"
            }</p>
            ${
              cancellationData.refundAmount
                ? `<p style="margin: 5px 0; color: #6b7280;"><strong>Refund Amount:</strong> ₹${(
                    cancellationData.refundAmount / 100
                  ).toFixed(2)}</p>`
                : ""
            }
          </div>

          ${
            cancellationData.refundAmount
              ? `<p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your refund will be processed within 5-7 business days to your original payment method.
          </p>`
              : ""
          }

          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            We're sorry to see you cancel your order. If you have any concerns, please contact us at <a href="mailto:support@vrikshvalley.com" style="color: #1c9e5b;">support@vrikshvalley.com</a>
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

function generateOrderConfirmationText(orderData) {
  const itemsText = orderData.items
    .map(
      (item) =>
        `${item.name} x ${item.quantity} - ₹${(item.price / 100).toFixed(2)}`
    )
    .join("\n");

  return `
Thank You for Your Order!

Hi ${orderData.customerName},

Your order has been received and is being processed.

Order Details:
- Order ID: ${orderData.orderId}
- Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}
- Payment Method: ${orderData.paymentMethod}

Order Items:
${itemsText}

Total: ₹${(orderData.total / 100).toFixed(2)}

Shipping Address:
${orderData.shippingAddress.line1}
${
  orderData.shippingAddress.line2 ? orderData.shippingAddress.line2 + "\n" : ""
}${orderData.shippingAddress.locality}, ${orderData.shippingAddress.city}
${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}

For questions, contact: support@vrikshvalley.com

© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.
  `.trim();
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
    ? `Refund Amount: ₹${(cancellationData.refundAmount / 100).toFixed(2)}`
    : ""
}

${
  cancellationData.refundAmount
    ? "Your refund will be processed within 5-7 business days."
    : ""
}

For questions, contact: support@vrikshvalley.com

© ${new Date().getFullYear()} Vriksh Valley. All rights reserved.
  `.trim();
}

export default {
  sendOrderConfirmation,
  sendShippingConfirmation,
  sendDeliveryNotification,
  sendCancellationConfirmation,
};
