import { Router } from 'express';
import { createPost, deletePost, getPost, getPosts, getPostsForTopic, likePost } from '../controllers/posts';
import { authenticateToken } from '../utils/authentificateToken';

const router = Router();

router.post('/', authenticateToken, createPost);
router.get('/', getPosts);
router.get('/:topicId', getPostsForTopic);
router.get('/:id', getPost);
router.delete('/:id', authenticateToken, deletePost);
router.put('/like/:id', authenticateToken, likePost);

export default router;
