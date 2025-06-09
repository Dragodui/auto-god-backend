import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
  } catch (error) {
    console.error('Email server connection failed:', error);
  }
};