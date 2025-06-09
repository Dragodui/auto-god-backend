import { Request, Response } from 'express';
import User from '../database/models/User';
import { hashPassword } from '../utils/hashPassword';
import comparePasswords from '../utils/comparePasswords';
import { IUser } from '../types';
import { generateToken } from '../utils/generateToken';
import redisClient from '../database/redis';
import logger from '../utils/logger';
import { transporter } from './../middleware/mailer';
import crypto from 'crypto';

export const register = async (req: Request, res: Response) => {
  logger.info('Registering new user...');
  try {
    const password = req.body.password;
    const passwordHash = await hashPassword(password);

    const newUser: IUser = new User({
      email: req.body.email,
      name: req.body.name,
      lastName: req.body.lastName,
      nickname:
        req.body.nickname ||
        `${req.body.name}${req.body.lastName.toUpperCase()}${Math.floor(Math.random() * 1000)}`,
      password: passwordHash,
    });

    await newUser.save();
    logger.info('New user created!');

    res.status(200).send({ message: 'User created' });
  } catch (e) {
    logger.error('Error registering user:', e);
    res.status(500).send({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  logger.info('Logging in...');
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const user: IUser | null = await User.findOne({
      $or: [{ email: login }, { nickname: login }],
    });
    if (!user) {
      logger.warn(`User not found for login: ${login}`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch: boolean = await comparePasswords(password, user.password);
    logger.info(`Password match: ${isMatch}`);
    if (!isMatch) {
      logger.warn(`Invalid password for user: ${login}`);
      res.status(404).json({ message: 'Invalid email/nickname or password' });
      return;
    }

    const token: string = generateToken(user._id as unknown as string);
    logger.info(`Token generated: ${token}`);
    await redisClient.set(`token:${token}`, user._id.toString(), {
      EX: 30 * 24 * 60 * 60,
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    });

    logger.info(`User ${user.email} logged in successfully`);
    res.status(200).json({ message: 'Logged in successfully' });
  } catch (e) {
    logger.error('Error during login:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token: string = req.cookies.token;
    if (token) {
      await redisClient.del(`token:${token}`);
      await redisClient.del(`userInfo:${req.userId}`);
    }
    res.clearCookie('token');
    logger.info(`User ${req.userId} logged out`);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyInfo = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.userId;
    if (!userId) {
      logger.warn('Unauthorized access to getMyInfo');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const cacheKey: string = `userInfo:${userId}`;
    const cachedUser: string | null = await redisClient.get(cacheKey);
    if (cachedUser) {
      logger.info(`User info for ${userId} found in cache`);
      res.status(200).json(JSON.parse(cachedUser));
      return;
    }

    const me: IUser | null = await User.findById(userId).select('-password');
    if (!me) {
      logger.warn(`User not found for ID: ${userId}`);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await redisClient.set(cacheKey, JSON.stringify(me), {
      EX: 30 * 24 * 60 * 60,
    });
    logger.info(`User info for ${userId} cached`);
    res.status(200).json(me);
  } catch (error) {
    logger.error('Error during getting user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  logger.info('Processing forgot password request...');
  try {
    const { email } = req.body;
    // const userId = req.userId;

    if (!email) {
      res.status(400).json({ message: 'Email is not found' });
      return;
    }

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(200).json({
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_HOST || 'http://localhost:5173'}/resetPassword/${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; 
                    color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Your App Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);

    res.status(200).json({
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Error during forgot password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  logger.info('Processing password reset...');
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    const user: IUser | null = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password and clear reset token
    user.password = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    // Invalidate all existing sessions for this user
    const pattern = `token:*`;
    const keys = await redisClient.keys(pattern);
    for (const key of keys) {
      const userId = await redisClient.get(key);
      if (userId === user._id.toString()) {
        await redisClient.del(key);
      }
    }
    await redisClient.del(`userInfo:${user._id}`);

    logger.info(`Password reset successful for user: ${user.email}`);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Error during password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
