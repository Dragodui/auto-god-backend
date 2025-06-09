import { Request, Response } from 'express';
import logger from '../utils/logger';
import Event from '../database/models/Event';
import redisClient from '../database/redis';
import { Types } from 'mongoose';
import { IEvent, ITag } from '../types';
import Tag from '../database/models/Tag';
import Comment from '../database/models/Comment';
import User from '../database/models/User';

export const uploadEventImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const newsId = req.params.id;
    if (!newsId) {
      res.status(401).json({ message: 'No news id provided' });
      return;
    }
    const imagePath = req.file.path;
    let fileName = imagePath.split('\\uploads\\').pop();
    fileName = '/uploads/' + fileName;
    const news: IEvent | null = await Event.findByIdAndUpdate(
      newsId,
      { image: fileName },
      { new: true }
    );
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }

    logger.info(`new ${newsId} updated image`);

    res.status(200).json({ message: 'Image uploaded', imagePath });
  } catch (error) {
    logger.error('Error in uploadNewsImage:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { date, title, place, content, tags } = req.body;
    if (!date || !title || !place || !content || !tags) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const event = new Event({
      authorId: userId,
      date: new Date(date),
      title,
      place,
      content,
      tags,
    });
    await event.save();
    await redisClient.del('allEvents');
    await redisClient.del(`event:${event._id}`);
    await redisClient.del(`allUnacceptedEvents`);
    logger.info(`Event created by user ${userId}: ${title}`);
    res.status(201).json({ message: 'Event created successfully', event });
    return;
  } catch (error) {
    logger.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const chachedEvents = await redisClient.get('allEvents');
    if (chachedEvents) {
      logger.info('Events fetched from cache');
      res.status(200).json(JSON.parse(chachedEvents));
      return;
    }
    const events = await Event.find({ isAccepted: true })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 });
    redisClient.set('allEvents', JSON.stringify(events), { EX: 900 });
    logger.info('Events fetched successfully');
    res.status(200).json(events);
    return;
  } catch (error) {
    logger.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    // const cachedEvent = await redisClient.get(`event:${req.params.id}`);
    // if (cachedEvent) {
    //     logger.info("Event fetched from cache");
    //     res.status(200).json(JSON.parse(cachedEvent));
    //     return;
    // }
    const eventId = req.params.id;
    const event: IEvent | null = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    const tags = await Tag.find({ _id: { $in: event.tags } });
    const author = await User.findById(event.authorId).select('-password');
    const comments = await Comment.find({ postId: event._id });
    const newObject = {
      id: event._id,
      title: event.title,
      content: event.content,
      date: event.date,
      place: event.place,
      author,
      tags,
      likes: event.likes,
      views: event.views,
      image: event.image,
      comments,
      createdAt: event.createdAt,
    };
    redisClient.set(`event:${eventId}`, JSON.stringify(event), { EX: 900 });
    res.status(200).json(newObject);
    return;
  } catch (error) {
    logger.error('Error fetching event by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const likeEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id;
    logger.info(`Liking event ${eventId}`);
    const event: IEvent | null = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event ${eventId} not found for liking`);
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    const userId = req.userId;
    if (!userId || userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (event.likes.includes(userId as any)) {
      logger.warn(`Event ${eventId} already liked by user ${userId}`);
      event.likes = event.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      await event.save();
    } else {
      event.likes.push(new Types.ObjectId(userId));
      await event.save();
    }
    const redisEvent = await redisClient.get(`event:${eventId}`);
    if (redisEvent) {
      const parsedEvent = JSON.parse(redisEvent);
      parsedEvent.likes = event.likes;
      await redisClient.set(`event:${eventId}`, JSON.stringify(parsedEvent), {
        EX: 900,
      });
      logger.info(`Event ${eventId} cache updated with new like count`);
    }
    await redisClient.del('allEvent');
    logger.info(`Event ${eventId} liked successfully`);
    res.status(200).json({ message: 'Event liked' });
    return;
  } catch (error) {
    logger.error('Error in likeEvent:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const viewEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id;
    logger.info(`Viewing event ${eventId}`);
    const event: IEvent | null = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event ${eventId} not found for view`);
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const userId = req.userId;
    if (event.views.includes(userId as any)) {
      logger.warn(`Event ${eventId} already viewed by user ${userId}`);
      res.status(400).json({ message: 'Event already viewed' });
      return;
    }
    event.views.push(req.userId as any);
    await event.save();

    const redisEvent = await redisClient.get(`event:${eventId}`);
    if (redisEvent) {
      const parsedEvent = JSON.parse(redisEvent);
      parsedEvent.likes = event.likes;
      await redisClient.set(`event:${eventId}`, JSON.stringify(parsedEvent), {
        EX: 900,
      });
      logger.info(`Event ${eventId} cache updated with new view count`);
    }
    await redisClient.del('allEvent');
    logger.info(`Event ${eventId} view successfully`);
    res.status(200).json({ message: 'Event viewed' });
    return;
  } catch (error) {
    logger.error('Error in viewEvent:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};
