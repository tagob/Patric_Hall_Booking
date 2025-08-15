import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const emailTemplates = {
  bookingConfirmation: (booking, user) => ({
    subject: 'Booking Confirmation - Patrician Halls',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Booking Confirmation</h1>
        <p>Dear ${user.name},</p>
        <p>Your booking has been confirmed with the following details:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Hall:</strong> ${booking.hallName}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Purpose:</strong> ${booking.purpose}</p>
        </div>
        <p>Thank you for using our service!</p>
      </div>
    `,
  }),

  bookingCancellation: (booking, user) => ({
    subject: 'Booking Cancellation - Patrician Halls',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">Booking Cancelled</h1>
        <p>Dear ${user.name},</p>
        <p>Your booking has been cancelled:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Hall:</strong> ${booking.hallName}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        </div>
        <p>If you did not request this cancellation, please contact us immediately.</p>
      </div>
    `,
  }),

  bookingReminder: (booking, user) => ({
    subject: 'Upcoming Booking Reminder - Patrician Halls',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Booking Reminder</h1>
        <p>Dear ${user.name},</p>
        <p>This is a reminder for your upcoming booking tomorrow:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Hall:</strong> ${booking.hallName}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Purpose:</strong> ${booking.purpose}</p>
        </div>
        <p>We look forward to hosting your event!</p>
      </div>
    `,
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request - Patrician Halls',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Password Reset Request</h1>
        <p>Dear ${user.name},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <div style="margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}"
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, please ignore this email or contact us if you have concerns.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  }),
};

export const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = emailTemplates[template](data.booking || data.user, data.resetToken);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`${template} email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending ${template} email:`, error);
    throw error;
  }
};

export const sendBookingConfirmation = (booking, user) => 
  sendEmail(user.email, 'bookingConfirmation', { booking, user });

export const sendBookingCancellation = (booking, user) => 
  sendEmail(user.email, 'bookingCancellation', { booking, user });

export const sendBookingReminder = (booking, user) => 
  sendEmail(user.email, 'bookingReminder', { booking, user });

export const sendPasswordReset = (user, resetToken) =>
  sendEmail(user.email, 'passwordReset', { user, resetToken });