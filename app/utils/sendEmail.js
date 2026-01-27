console.log(">>> sendEmail.js LOADED <<<");

const nodemailer = require('nodemailer');

if (process.env.NODE_ENV !== 'production') {
  console.log('[mail] EMAIL_HOST =', process.env.EMAIL_HOST);
  console.log('[mail] EMAIL_PORT =', process.env.EMAIL_PORT);
  console.log('[mail] EMAIL_USER =', process.env.EMAIL_USER);
  console.log(
    '[mail] EMAIL_PASSWORD length =',
    (process.env.EMAIL_PASSWORD || '').length
  );
}

/**
 * Helper: create transporter with safe defaults
 */
const mailPort = Number(process.env.EMAIL_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: mailPort,
  secure: mailPort === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Verify SMTP on startup (helps catch config issues early)
 */
transporter.verify((err) => {
  if (err) {
    console.error('[mail] SMTP verify failed:', err.message);
  } else {
    console.log('[mail] SMTP ready');
  }
});

/**
 * Send email function
 * options: { to, subject, html?, text? }
 */
exports.sendEmail = async (options) => {
  try {
    if (!options?.to) throw new Error('Missing "to" in sendEmail options');
    if (!options?.subject) throw new Error('Missing "subject" in sendEmail options');
    if (!options?.html && !options?.text) {
      throw new Error('Missing "html" or "text" in sendEmail options');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `Fashion Shop <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || undefined,
      text: options.text || undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[mail] Email sent:', info.messageId);
    }
    return info;
  } catch (error) {
    console.error('[mail] Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Chào mừng ${user.fullName || ''}!</h1>
    <p>Cảm ơn bạn đã đăng ký tài khoản tại Fashion Shop.</p>
    <p>Bắt đầu mua sắm ngay hôm nay!</p>
    <a href="${process.env.CLIENT_URL || '#'}"
       style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
      Bắt đầu mua sắm
    </a>
  `;

  return exports.sendEmail({
    to: user.email,
    subject: 'Chào mừng đến với Fashion Shop!',
    html,
  });
};

/**
 * Send order confirmation email
 */
exports.sendOrderConfirmation = async (order, user) => {
  const total = Number(order?.totalAmount || 0).toLocaleString('vi-VN');

  const html = `
    <h1>Đơn hàng #${order?.orderNumber || ''} đã được xác nhận!</h1>
    <p>Xin chào ${user?.fullName || ''},</p>
    <p>Cảm ơn bạn đã đặt hàng tại Fashion Shop.</p>
    <h2>Thông tin đơn hàng:</h2>
    <ul>
      <li>Mã đơn hàng: ${order?.orderNumber || ''}</li>
      <li>Tổng tiền: ${total} VNĐ</li>
      <li>Trạng thái: ${order?.status || ''}</li>
    </ul>
    <p>Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng.</p>
  `;

  return exports.sendEmail({
    to: user.email,
    subject: `Xác nhận đơn hàng #${order?.orderNumber || ''}`,
    html,
  });
};
