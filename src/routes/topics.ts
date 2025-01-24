import { Router } from 'express';
import { getAllTopics, getTopic } from '../controllers/topics';


const router = Router();

router.get('/', getAllTopics);
router.get('/:topicId', getTopic);

export default router;
