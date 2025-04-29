import { Router } from 'express';
import { authenticateToken } from '../utils/authenticateToken';
import { checkAdmin } from '../utils/checkAdmin';
import { deletePost, deleteComment, deleteNews } from '../controllers/adminController';

const router = Router();

// Delete routes with admin middleware
router.delete('/posts/:postId', authenticateToken, checkAdmin, deletePost);
router.delete('/comments/:commentId', authenticateToken, checkAdmin, deleteComment);
router.delete('/news/:newsId', authenticateToken, checkAdmin, deleteNews);

export default router; 