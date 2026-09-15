/**
 * Resend Email Utility
 * Integrates Resend API for OTP Email Verification, Password Reset, Customer Order Receipts, and Admin Alerts
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'G Naath Global <onboarding@resend.dev>';
const ADMIN_EMAIL = 'gnaathglobal@gmail.com';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured.');
    }

    const recipients = Array.isArray(to) ? to : [to];
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API Error:', data);
      return { success: false, error: data.message || 'Failed to send email via Resend' };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending email via Resend API:', error);
    return { success: false, error: error.message || 'Network error sending email' };
  }
}

/**
 * Sends 6-digit OTP Verification Email for Account Registration or Password Reset
 */
export async function sendOtpEmail(email: string, code: string, type: 'REGISTER' | 'PASSWORD_RESET') {
  const isRegister = type === 'REGISTER';
  const title = isRegister ? 'Verify Your G Naath Account' : 'Reset Your Password';
  const subtitle = isRegister
    ? 'Use the 6-digit OTP code below to complete your account registration.'
    : 'Use the 6-digit OTP code below to reset your G Naath account password.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; color: #1e293b;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="color: #10b981; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">G NAATH GLOBAL</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase;">COMMUNICATIONS LTD</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0;">${title}</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">${subtitle}</p>

        <div style="background-color: #f1f5f9; border: 2px dashed #10b981; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
          <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${code}</span>
          <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0; font-weight: 600;">This code expires in 15 minutes.</p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">If you did not request this code, please ignore this email.</p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

        <div style="font-size: 12px; color: #94a3b8; text-align: center;">
          <p style="margin: 4px 0;"><strong>G Naath Global Communications Ltd</strong> • RC: 6898302</p>
          <p style="margin: 4px 0;">Lagos Head Office & ABSU Uturu Branch</p>
          <p style="margin: 4px 0;">WhatsApp: +234 703 479 1996</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `[G Naath Global] ${code} is your ${isRegister ? 'Verification Code' : 'Password Reset Code'}`,
    html,
  });
}

/**
 * Sends Customer Order Receipt Email upon order placement
 */
export async function sendOrderReceiptEmail(email: string, name: string, order: any) {
  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #0f172a;">${item.productName || item.product?.name || 'Item'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: center; color: #475569;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; color: #1e293b;">
      <div style="background-color: #0f172a; padding: 28px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="color: #10b981; margin: 0; font-size: 24px; font-weight: 900;">G NAATH GLOBAL</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase;">Order Receipt & Confirmation</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">Order #${order.orderNumber}</h2>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Placed on ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
          <div>
            <span style="background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 20px; text-transform: uppercase;">${order.orderStatus || 'PENDING'}</span>
          </div>
        </div>

        <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">Thank you for your order at G Naath Global Communications Ltd! We have received your order and our dispatch team is processing it.</p>

        <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 24px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b;">Product</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #64748b;">Qty</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #64748b;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right; font-size: 18px; font-weight: 900; color: #0f172a;">
          Total Amount: <span style="color: #10b981;">₦${(order.totalAmount || 0).toLocaleString()}</span>
        </div>

        <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin-top: 24px; font-size: 13px; color: #475569;">
          <strong style="color: #0f172a;">Delivery Address:</strong><br />
          ${order.customerAddress}, ${order.customerCity}<br />
          Phone: ${order.customerPhone}<br />
          Branch: ${order.preferredBranch === 'abia_branch_office' ? 'Abia State ABSU Branch' : 'Lagos Head Office (Ago Palace)'}
        </div>

        <div style="margin-top: 28px; text-align: center;">
          <a href="https://wa.me/2347034791996?text=Hello%20G%20Naath,%20I%20want%20to%20track%20Order%20%23${order.orderNumber}" style="background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 24px; border-radius: 24px; display: inline-block;">Track Order on WhatsApp</a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmation #${order.orderNumber} - G Naath Global`,
    html,
  });
}

/**
 * Sends Admin Order Notification to gnaathglobal@gmail.com
 */
export async function sendAdminOrderNotification(order: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a;">
      <h2 style="color: #10b981;">⚡ New Customer Order Received!</h2>
      <p><strong>Order #:</strong> ${order.orderNumber}</p>
      <p><strong>Customer Name:</strong> ${order.customerName}</p>
      <p><strong>Customer Email:</strong> ${order.customerEmail || 'N/A'}</p>
      <p><strong>Customer Phone:</strong> ${order.customerPhone}</p>
      <p><strong>Delivery Address:</strong> ${order.customerAddress}, ${order.customerCity}</p>
      <p><strong>Preferred Branch:</strong> ${order.preferredBranch}</p>
      <p><strong>Total Amount:</strong> ₦${(order.totalAmount || 0).toLocaleString()}</p>
      <p>Log in to your Admin Portal to process this order.</p>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ADMIN ALERT] New Order #${order.orderNumber} - ₦${(order.totalAmount || 0).toLocaleString()}`,
    html,
  });
}
