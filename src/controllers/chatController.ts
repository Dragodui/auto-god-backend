import { Request, Response } from 'express';
import Chat, { IChat, IMessage } from '../database/models/Chat';
import Item from '../database/models/Item';
import mongoose from 'mongoose';

export const createChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    const existingChat = await Chat.findOne({
      item: itemId,
      participants: { $all: [req.userId, item.seller] },
    });

    if (existingChat) {
      res.json(existingChat);
      return;
    }

    const chat = new Chat({
      participants: [req.userId, item.seller],
      item: itemId,
      messages: [],
    });

    await chat.save();
    res.status(201).json(chat);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat', error });
    return;
  }
};

export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({
      participants: req.userId,
    })
      .populate('participants', 'email nickname name avatar')
      .populate('item', 'title photos')
      .sort({ updatedAt: -1 });

    res.json(chats);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats', error });
    return;
  }
};

export const getChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'email nickname name avatar')
      .populate('item', 'title photos');

    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Check if user is a participant
    if (
      !chat.participants.some(
        (p) => p._id.toString() === req.userId?.toString()
      )
    ) {
      res.status(403).json({ message: 'Not authorized to access this chat' });
      return;
    }

    res.json(chat);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error });
    return;
  }
};

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Check if user is a participant
    if (
      !chat.participants.some((p) => p.toString() === req.userId?.toString())
    ) {
      res
        .status(403)
        .json({ message: 'Not authorized to send messages in this chat' });
      return;
    }

    const message: IMessage = {
      sender: new mongoose.Types.ObjectId(req.userId!),
      content,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // Emit socket event for real-time updates
    req.app
      .get('io')
      .to((chat._id as string).toString())
      .emit('new-message', {
        chatId: chat._id,
        message,
      });

    res.json(message);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
    return;
  }
};
