import { Router } from 'express';
import { authenticateToken } from '../utils/authentificateToken';
import {
  createComment,
  getComments,
  likeComment,
} from '../controllers/comments';

const router = Router();

router.post('/', authenticateToken, createComment);
router.get('/:postId', getComments);
router.put('/like/:id', authenticateToken, likeComment);

export default router;
