import { Router } from 'express';
import {
  createTopic,
  getAllTopics,
  getTopic,
} from '../controllers/topicsController';

const router = Router();

router.get('/', getAllTopics);
router.get('/:topicId', getTopic);
router.post('/', createTopic);

export default router;
