import { Router } from 'express';
import {
  createNews,
  deleteNews,
  getOneNews,
  getNews,
  getNewsForTopic,
  likeNews,
  uploadNewsImage,
  viewNews,
} from '../controllers/newsController';
import { authenticateToken } from '../utils/authenticateToken';
import upload from '../utils/multerConfig';

const router = Router();

router.post(
  '/:id/image',
  authenticateToken,
  upload.single('image'),
  uploadNewsImage
);
router.post('/', authenticateToken, createNews);
router.get('/', getNews);
router.get('/topic/:topicName', getNewsForTopic);
router.get('/:id', getOneNews);
router.delete('/:id', authenticateToken, deleteNews);
router.put('/like/:id', authenticateToken, likeNews);
router.put('/views/:id', authenticateToken, viewNews);

export default router;
