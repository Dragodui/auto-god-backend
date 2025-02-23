import { Request, Response } from 'express';
import logger from '../utils/logger';
import User from '../database/models/User';
import Topic from '../database/models/Topic';
import Post from '../database/models/Post';
import News from '../database/models/News';

interface Stats {
  users: number;
  topics: number;
  posts: number;
  news: number;
}

export const getStats = async (req: Request, res: Response) => {
  try {
    const users: number = await User.find().countDocuments();
    const topics: number = await Topic.find().countDocuments();
    const posts: number = await Post.find().countDocuments();
    const news: number = await News.find().countDocuments();
    const stats: Stats = { users, topics, posts, news };
    res.status(200).json(stats);
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
