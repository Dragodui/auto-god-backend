import { Request, Response } from 'express';
import User from '../database/models/User';
import { hashPassword } from '../utils/hashPassword';
import comparePasswords from '../utils/comparePasswords';
import { IUser } from '../types';
import { generateToken } from '../utils/generateToken';
import redisClient from '../database/redis';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  logger.info('Registering new user...');
  try {
    const password = req.body.password;
    const passwordHash = await hashPassword(password);

    const newUser: IUser = new User({
      email: req.body.email,
      name: req.body.name,
      lastName: req.body.lastName,
      nickname: req.body.nickname,
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
