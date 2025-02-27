import { Router } from 'express';
import {
  createNews,
  deleteNews,
  getOneNews,
  getNews,
  getNewsForTopic,
  likeNews,
  uploadNewsImage,
} from '../controllers/newsController';
import { authenticateToken } from '../utils/authenticateToken';
import upload from '../utils/multerConfig';

const router = Router();

router.post('/', authenticateToken, createNews);
router.get('/', getNews);
router.post(
  '/:id/image',
  authenticateToken,
  upload.single('image'),
  uploadNewsImage
);
router.get('/:topicName', getNewsForTopic);
router.get('/:id', getOneNews);
router.delete('/:id', authenticateToken, deleteNews);
router.put('/like/:id', authenticateToken, likeNews);

export default router;
