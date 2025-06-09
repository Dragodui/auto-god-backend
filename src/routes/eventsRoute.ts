import { Router } from 'express';
import { authenticateToken } from '../utils/authenticateToken';

import {
  createEvent,
  getEvent,
  getEvents,
  likeEvent,
  viewEvent,
  uploadEventImage,
} from '../controllers/eventsController';
import upload from '../utils/multerConfig';

const router = Router();

router.post('/', authenticateToken, createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/like/:id', authenticateToken, likeEvent);
router.put('/views/:id', authenticateToken, viewEvent);
router.post(
  '/:id/image',
  authenticateToken,
  upload.single('image'),
  uploadEventImage
);
export default router;
