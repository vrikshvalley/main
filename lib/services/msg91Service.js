/**
 * MSG91 Communication Service
 *
 * Centralized service for Email, SMS, and WhatsApp communications via MSG91
 * API Documentation: https://docs.msg91.com/
 */

const MSG91_CONFIG = {
  authKey: process.env.MSG91_AUTH_KEY,
  emailDomain: process.env.MSG91_EMAIL_DOMAIN,
  senderEmail: process.env.MSG91_SENDER_EMAIL,
  senderName: process.env.MSG91_SENDER_NAME,
  senderId: process.env.MSG91_SENDER_ID, // For SMS
  smsRoute: process.env.MSG91_SMS_ROUTE || "4", // Default transactional
  whatsappNumber: process.env.MSG91_WHATSAPP_NUMBER,
  baseUrl: "https://control.msg91.com/api/v5",
};

// ==================== EMAIL SERVICE ====================

/**
 * Send email using MSG91 Email API
 * @param {Object} params - Email parameters
 * @param {Array} params.recipients - Array of recipient objects
 * @param {string} params.templateId - MSG91 email template ID
 * @param {string} params.subject - Email subject (if not in template)
 * @param {Object} params.variables - Template variables
 * @param {Array} params.attachments - Optional file attachments
 * @returns {Promise<Object>} - API response
 */
export async function sendEmail({
  recipients,
  templateId,
  subject,
  variables = {},
  attachments = [],
}) {
  try {
    const payload = {
      recipients: recipients.map((recipient) => ({
        to: [
          {
            name: recipient.name || recipient.email,
            email: recipient.email,
          },
        ],
        variables: { ...variables, ...recipient.variables },
      })),
      from: {
        name: MSG91_CONFIG.senderName,
        email: MSG91_CONFIG.senderEmail,
      },
      domain: MSG91_CONFIG.emailDomain,
      template_id: templateId,
    };

    if (subject) {
      payload.subject = subject;
    }

    if (attachments.length > 0) {
      payload.attachments = attachments;
    }

    const response = await fetch(`${MSG91_CONFIG.baseUrl}/email/send`, {
      method: "POST",
      headers: {
        accept: "application/json",
        authkey: MSG91_CONFIG.authKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `MSG91 Email Error: ${data.message || response.statusText}`
      );
    }

    console.log("✅ Email sent successfully via MSG91:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ MSG91 Email Error:", error);
    throw error;
  }
}

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @returns {Promise<Object>}
 */
export async function sendOrderConfirmationEmail(order, user) {
  return sendEmail({
    recipients: [
      {
        email: user.email,
        name: user.full_name,
      },
    ],
    templateId: "order_confirmation", // Create this template in MSG91
    variables: {
      user_name: user.full_name,
      order_id: order.order_id,
      order_date: order.order_date,
      total_amount: order.total,
      items_count: order.items.length,
      order_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.order_id}`,
    },
  });
}

/**
 * Send order status update email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @param {string} status - New order status
 * @returns {Promise<Object>}
 */
export async function sendOrderStatusEmail(order, user, status) {
  return sendEmail({
    recipients: [
      {
        email: user.email,
        name: user.full_name,
      },
    ],
    templateId: "order_status_update", // Create this template in MSG91
    variables: {
      user_name: user.full_name,
      order_id: order.order_id,
      status: status,
      tracking_url: order.tracking_url || "#",
      order_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.order_id}`,
    },
  });
}

/**
 * Send password reset email (if implementing password-based auth)
 * @param {string} email - User email
 * @param {string} resetLink - Password reset link
 * @returns {Promise<Object>}
 */
export async function sendPasswordResetEmail(email, resetLink) {
  return sendEmail({
    recipients: [{ email }],
    templateId: "password_reset", // Create this template in MSG91
    variables: {
      reset_link: resetLink,
      expiry_time: "24 hours",
    },
  });
}

/**
 * Send contact form submission notification
 * @param {Object} formData - Contact form data
 * @returns {Promise<Object>}
 */
export async function sendContactFormEmail(formData) {
  return sendEmail({
    recipients: [
      {
        email: MSG91_CONFIG.senderEmail, // Send to your support email
        name: "Vriksh Valley Support",
      },
    ],
    templateId: "contact_form_notification", // Create this template in MSG91
    variables: {
      sender_name: formData.name,
      sender_email: formData.email,
      sender_phone: formData.phone || "Not provided",
      message: formData.message,
      submitted_at: new Date().toISOString(),
    },
  });
}

// ==================== SMS SERVICE (Future Implementation) ====================

/**
 * Send SMS using MSG91 SMS API
 * NOTE: Implement this when ready to use SMS
 * @param {string} mobile - Mobile number with country code
 * @param {string} message - SMS message or template
 * @param {string} templateId - SMS template ID (optional)
 * @returns {Promise<Object>}
 */
export async function sendSMS(mobile, message, templateId = null) {
  try {
    // TODO: Implement SMS sending
    console.log("📱 SMS Service - To be implemented");
    console.log("Mobile:", mobile);
    console.log("Message:", message);

    /*
    const payload = {
      sender: MSG91_CONFIG.senderId,
      route: MSG91_CONFIG.smsRoute,
      country: '91', // India
      sms: [
        {
          message: message,
          to: [mobile]
        }
      ]
    };

    const response = await fetch(`${MSG91_CONFIG.baseUrl}/flow/`, {
      method: 'POST',
      headers: {
        'authkey': MSG91_CONFIG.authKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
    */

    return { success: false, message: "SMS service not yet implemented" };
  } catch (error) {
    console.error("❌ MSG91 SMS Error:", error);
    throw error;
  }
}

/**
 * Send OTP via SMS
 * NOTE: Implement this when ready to use SMS OTP
 * @param {string} mobile - Mobile number
 * @param {string} otp - OTP code
 * @returns {Promise<Object>}
 */
export async function sendOTPSMS(mobile, otp) {
  // TODO: Implement OTP SMS
  console.log("📱 OTP SMS - To be implemented");
  return { success: false, message: "OTP SMS service not yet implemented" };
}

/**
 * Send order confirmation SMS
 * NOTE: Implement this when ready to use SMS
 * @param {string} mobile - User mobile number
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
export async function sendOrderSMS(mobile, order) {
  // TODO: Implement order SMS
  console.log("📱 Order SMS - To be implemented");
  return { success: false, message: "Order SMS service not yet implemented" };
}

// ==================== WHATSAPP SERVICE (Future Implementation) ====================

/**
 * Send WhatsApp message using MSG91 WhatsApp API
 * NOTE: Implement this when ready to use WhatsApp
 * @param {string} mobile - Mobile number with country code
 * @param {string} templateName - WhatsApp template name
 * @param {Object} params - Template parameters
 * @returns {Promise<Object>}
 */
export async function sendWhatsAppMessage(mobile, templateName, params = {}) {
  try {
    // TODO: Implement WhatsApp messaging
    console.log("💬 WhatsApp Service - To be implemented");
    console.log("Mobile:", mobile);
    console.log("Template:", templateName);

    /*
    const payload = {
      integrated_number: MSG91_CONFIG.whatsappNumber,
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        to: mobile,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: Object.keys(params).map(key => ({
                type: 'text',
                text: params[key]
              }))
            }
          ]
        }
      }
    };

    const response = await fetch(`${MSG91_CONFIG.baseUrl}/whatsapp/whatsapp-outbound-message/bulk/`, {
      method: 'POST',
      headers: {
        'authkey': MSG91_CONFIG.authKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
    */

    return { success: false, message: "WhatsApp service not yet implemented" };
  } catch (error) {
    console.error("❌ MSG91 WhatsApp Error:", error);
    throw error;
  }
}

/**
 * Send order confirmation via WhatsApp
 * NOTE: Implement this when ready to use WhatsApp
 * @param {string} mobile - User mobile number
 * @param {Object} order - Order object
 * @returns {Promise<Object>}
 */
export async function sendOrderWhatsApp(mobile, order) {
  // TODO: Implement order WhatsApp
  console.log("💬 Order WhatsApp - To be implemented");
  return {
    success: false,
    message: "Order WhatsApp service not yet implemented",
  };
}

/**
 * Send delivery update via WhatsApp
 * NOTE: Implement this when ready to use WhatsApp
 * @param {string} mobile - User mobile number
 * @param {Object} order - Order object
 * @param {string} status - Delivery status
 * @returns {Promise<Object>}
 */
export async function sendDeliveryWhatsApp(mobile, order, status) {
  // TODO: Implement delivery WhatsApp
  console.log("💬 Delivery WhatsApp - To be implemented");
  return {
    success: false,
    message: "Delivery WhatsApp service not yet implemented",
  };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validate MSG91 configuration
 * @returns {Object} - Validation result
 */
export function validateMSG91Config() {
  const required = ["authKey", "emailDomain", "senderEmail"];
  const missing = required.filter((key) => !MSG91_CONFIG[key]);

  if (missing.length > 0) {
    return {
      valid: false,
      message: `Missing MSG91 configuration: ${missing.join(", ")}`,
      missing,
    };
  }

  return { valid: true, message: "MSG91 configured successfully" };
}

/**
 * Test MSG91 email connection
 * @param {string} testEmail - Email to send test message to
 * @returns {Promise<Object>}
 */
export async function testEmailConnection(testEmail) {
  try {
    return await sendEmail({
      recipients: [{ email: testEmail, name: "Test User" }],
      templateId: "test_email", // Create a simple test template
      variables: {
        test_message: "This is a test email from Vriksh Valley",
      },
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default {
  // Email functions
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail,
  sendContactFormEmail,

  // SMS functions (to be implemented)
  sendSMS,
  sendOTPSMS,
  sendOrderSMS,

  // WhatsApp functions (to be implemented)
  sendWhatsAppMessage,
  sendOrderWhatsApp,
  sendDeliveryWhatsApp,

  // Utilities
  validateMSG91Config,
  testEmailConnection,
};
