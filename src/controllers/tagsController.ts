import { Request, Response } from 'express';
import Tag from '../database/models/Tag';
import Post from '../database/models/Post';
import redisClient from '../database/redis';
import logger from '../utils/logger';
import { ITag } from '../types';

export const getAllTags = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info('Fetching all tags');
    const tags: ITag[] = await Tag.find();
    await redisClient.set('allTags', JSON.stringify(tags), { EX: 900 });
    logger.info('All tags fetched and cached');
    res.status(200).json(tags);
  } catch (error) {
    logger.error('Error fetching all tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostTags = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.postId;
    logger.info(`Fetching tags for post ${postId}`);
    const post = await Post.findById(postId);
    if (!post) {
      logger.warn(`Post not found: ${postId}`);
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    const tags: ITag[] = await Tag.find({ _id: { $in: post.tags } });
    logger.info(`Tags for post ${postId} fetched`);
    res.status(200).json(tags);
  } catch (error) {
    logger.error('Error fetching post tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
