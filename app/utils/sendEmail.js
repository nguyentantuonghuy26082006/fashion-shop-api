const nodemailer = require('nodemailer');

// Tạo transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email function
 */
exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `Fashion Shop <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Chào mừng ${user.fullName}!</h1>
    <p>Cảm ơn bạn đã đăng ký tài khoản tại Fashion Shop.</p>
    <p>Bắt đầu mua sắm ngay hôm nay!</p>
    <a href="${process.env.CLIENT_URL}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Bắt đầu mua sắm
    </a>
  `;

  await exports.sendEmail({
    to: user.email,
    subject: 'Chào mừng đến với Fashion Shop!',
    html
  });
};

/**
 * Send order confirmation email
 */
exports.sendOrderConfirmation = async (order, user) => {
  const html = `
    <h1>Đơn hàng #${order.orderNumber} đã được xác nhận!</h1>
    <p>Xin chào ${user.fullName},</p>
    <p>Cảm ơn bạn đã đặt hàng tại Fashion Shop.</p>
    <h2>Thông tin đơn hàng:</h2>
    <ul>
      <li>Mã đơn hàng: ${order.orderNumber}</li>
      <li>Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')} VNĐ</li>
      <li>Trạng thái: ${order.status}</li>
    </ul>
    <p>Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng.</p>
  `;

  await exports.sendEmail({
    to: user.email,
    subject: `Xác nhận đơn hàng #${order.orderNumber}`,
    html
  });
};