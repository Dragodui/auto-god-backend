import { Router } from 'express';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getPostsForTopic,
  likePost,
} from '../controllers/postsController';
import { authenticateToken } from '../utils/authenticateToken';

const router = Router();

router.post('/', authenticateToken, createPost);
router.get('/', getPosts);
router.get('/:topicName', getPostsForTopic);
router.get('/:id', getPost);
router.delete('/:id', authenticateToken, deletePost);
router.put('/like/:id', authenticateToken, likePost);

export default router;
