import express, { RequestHandler } from 'express';
import { authenticateToken } from '../utils/authenticateToken';
import {
  createChat,
  getChats,
  getChatById,
  sendMessage
} from '../controllers/chatController';

const router = express.Router();

router.use(authenticateToken);

router.post('/item/:itemId', createChat);
router.get('/', getChats);
router.get('/:id', getChatById);
router.post('/:id/messages', sendMessage);

export default router; 