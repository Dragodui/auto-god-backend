// src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../database/models/User';
import { IUser } from '../interfaces';
import logger from '../utils/logger';

export const updateUserAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const avatarPath: string = req.file.path;

    const user: IUser | null = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    logger.info(`User ${userId} updated avatar`);
    res.status(200).json({ message: 'Avatar updated', avatar: avatarPath });
  } catch (error) {
    logger.error('Error updating user avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
