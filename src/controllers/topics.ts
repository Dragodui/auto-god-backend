import { Request, Response } from 'express';
import Topic from '../database/models/Topic';
import redisClient from '../database/redis';
import logger from '../utils/logger';
import { ITopic } from '../interfaces';

export const getAllTopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info('Fetching all topics');
    const topics: ITopic[] | null = await Topic.find();
    if (!topics) {
      logger.warn('No topics found');
      res.status(404).json({ message: 'No topics found' });
      return;
    }
    await redisClient.set('allTopics', JSON.stringify(topics), { EX: 900 });
    logger.info('All topics fetched and cached');
    res.status(200).json(topics);
  } catch (error) {
    logger.error('Error fetching all topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const topicId = req.params.topicId;
    logger.info(`Fetching topic with id: ${topicId}`);
    const topic: ITopic | null = await Topic.findById(topicId);
    if (!topic) {
      logger.warn(`Topic not found: ${topicId}`);
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    await redisClient.set(`topic:${topicId}`, JSON.stringify(topic), {
      EX: 900,
    });
    logger.info(`Topic ${topicId} fetched and cached`);
    res.status(200).json(topic);
  } catch (error) {
    logger.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, cover } = req.body;
    const newTopic: ITopic = new Topic({ title, cover });
    await newTopic.save();
    logger.info(`Topic ${newTopic._id} created`);
    res.status(201).json(newTopic);
  } catch (error) {
    logger.error('Error creating topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
