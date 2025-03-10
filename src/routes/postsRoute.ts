import { Router } from 'express';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getPostsForTopic,
  likePost,
  uploadPostImage,
} from '../controllers/postsController';
import { authenticateToken } from '../utils/authenticateToken';
import upload from '../utils/multerConfig';

const router = Router();

router.post('/', authenticateToken, createPost);
router.get('/', getPosts);
router.get('/topic/:topicName', getPostsForTopic);
router.get('/:id', getPost);
router.delete('/:id', authenticateToken, deletePost);
router.put('/like/:id', authenticateToken, likePost);
router.post(
  '/:id/image',
  authenticateToken,
  upload.single('image'),
  uploadPostImage
);

export default router;
