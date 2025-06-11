import { Request, Response } from 'express';
import Notification from '../database/models/Notification';
import logger from '../utils/logger';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.status(200).json(notification);
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 