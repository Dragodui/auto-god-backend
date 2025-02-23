import { Router } from 'express';
import {
  createNews,
  deleteNews,
  getOneNews,
  getNews,
  getNewsForTopic,
  likeNews,
} from '../controllers/newsController';
import { authenticateToken } from '../utils/authenticateToken';

const router = Router();

router.post('/', authenticateToken, createNews);
router.get('/', getNews);
router.get('/:topicId', getNewsForTopic);
router.get('/:id', getNews);
router.delete('/:id', authenticateToken, deleteNews);
router.put('/like/:id', authenticateToken, likeNews);

export default router;
