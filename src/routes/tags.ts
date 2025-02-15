import { Router } from 'express';
import { authenticateToken } from '../utils/authenticateToken';
import { getAllTags, getPostTags } from '../controllers/tags';

const router = Router();

router.get('/', getAllTags);
router.get('/:postId', getPostTags);

export default router;
