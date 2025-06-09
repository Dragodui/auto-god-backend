import { Router } from 'express';
import { authenticateToken } from '../utils/authenticateToken';
import { checkAdmin } from '../utils/checkAdmin';
import {
  deletePost,
  deleteComment,
  deleteNews,
  deleteEvent,
  acceptEvent,
  getUnacceptedEvents,
} from '../controllers/adminController';

const router = Router();

router.delete('/posts/:postId', authenticateToken, checkAdmin, deletePost);
router.delete(
  '/comments/:commentId',
  authenticateToken,
  checkAdmin,
  deleteComment
);
router.delete('/news/:newsId', authenticateToken, checkAdmin, deleteNews);
router.delete('/events/:eventId', authenticateToken, checkAdmin, deleteEvent);
router.put('/events/:eventId', authenticateToken, checkAdmin, acceptEvent);
router.get('/events', authenticateToken, checkAdmin, getUnacceptedEvents);

export default router;
