import express, { RequestHandler } from 'express';
import { upload } from '../middleware/upload';
import {
  createItem,
  getItems,
  getItemById,
  purchaseItem,
  getUserItems
} from '../controllers/itemController';
import { authenticateToken } from '../utils/authenticateToken';

const router = express.Router();

// Public routes
router.get('/', getItems as RequestHandler);
router.get('/:id', getItemById as RequestHandler);

// Protected routes
router.post('/', authenticateToken, upload.array('photos', 5), createItem);
router.post('/:id/purchase', authenticateToken, purchaseItem);
router.get('/user/items', authenticateToken, getUserItems);

export default router; 