import { Request, Response } from 'express';
import Ban from '../database/models/Ban';
import User from '../database/models/User';
import logger from '../utils/logger';

export const banUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, reason, duration } = req.body;
    const adminId = req.userId;

    if (!adminId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is already banned
    const existingBan = await Ban.findOne({ userId, isActive: true });
    if (existingBan) {
      res.status(400).json({ message: 'User is already banned' });
      return;
    }

    // Calculate expiration date if duration is provided (in days)
    const expiresAt = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : undefined;

    const ban = new Ban({
      userId,
      adminId,
      reason,
      expiresAt,
      isActive: true,
    });

    await ban.save();

    // Update user's banned status
    user.isBanned = true;
    await user.save();

    logger.info(`User ${userId} banned by admin ${adminId}`);
    res.json({ message: 'User banned successfully', ban });
  } catch (error) {
    logger.error('Error banning user:', error);
    res.status(500).json({ message: 'Error banning user' });
  }
};

export const unbanUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const adminId = req.userId;

    if (!adminId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const ban = await Ban.findOne({ userId, isActive: true });
    if (!ban) {
      res.status(404).json({ message: 'No active ban found for this user' });
      return;
    }

    ban.isActive = false;
    await ban.save();

    // Update user's banned status
    const user = await User.findById(userId);
    if (user) {
      user.isBanned = false;
      await user.save();
    }

    logger.info(`User ${userId} unbanned by admin ${adminId}`);
    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    logger.error('Error unbanning user:', error);
    res.status(500).json({ message: 'Error unbanning user' });
  }
};

export const getBannedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bans = await Ban.find({ isActive: true })
      .populate('userId', 'username email')
      .populate('adminId', 'username')
      .sort({ createdAt: -1 });

    res.json(bans);
  } catch (error) {
    logger.error('Error fetching banned users:', error);
    res.status(500).json({ message: 'Error fetching banned users' });
  }
};
