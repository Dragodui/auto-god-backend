import { Router } from 'express';
import { authenticateToken } from '../utils/authenticateToken';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationsController';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.put('/read/:notificationId', authenticateToken, markAsRead);
router.put('/read-all', authenticateToken, markAllAsRead);
router.delete('/:notificationId', authenticateToken, deleteNotification);

export default router; 