import { Request, Response, NextFunction } from 'express';
import User from '../database/models/User';
import logger  from './logger';

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error in checkAdmin middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 