import { Request, Response } from 'express';
import Post from '../database/models/Post';
import Topic from '../database/models/Topic';
import Tag from '../database/models/Tag';
import redisClient from '../database/redis';
import { IPost, ITag } from '../types';
import logger from '../utils/logger';

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, content, tags, topicId } = req.body;
    if (!title || !content || !tags || !topicId) {
      logger.warn('Missing fields in createPost request');
      res.status(400).json({ message: 'Please provide all fields' });
      return;
    }
    const userId = req.userId;
    logger.info(`User ${userId} is creating a post in topic ${topicId}`);
    const newPost: IPost = await Post.create({
      title,
      content,
      tags,
      topicId,
      authorId: userId,
    });
    await newPost.save();
    await redisClient.del('allPosts');
    await redisClient.del(`topicPosts:${topicId}`);
    logger.info(`Post ${newPost._id} created by user ${userId}`);
    res.status(201).json({ message: 'Post created' });
  } catch (error) {
    logger.error('Error in createPost:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all posts');
    const redisPosts = await redisClient.get('allPosts');
    if (redisPosts) {
      logger.info('Posts fetched from cache');
      res.status(200).json(JSON.parse(redisPosts));
      return;
    }
    const posts: IPost[] | null = await Post.find();
    await redisClient.set('allPosts', JSON.stringify(posts), { EX: 900 });
    logger.info('Posts fetched from DB and cached');
    res.status(200).json(posts);
  } catch (error) {
    logger.error('Error in getPosts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostsForTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const topicId = req.params.topicId;
    logger.info(`Fetching posts for topic ${topicId}`);
    const redisPosts = await redisClient.get(`topicPosts:${topicId}`);
    if (redisPosts) {
      logger.info(`Posts for topic ${topicId} fetched from cache`);
      res.status(200).json(JSON.parse(redisPosts));
      return;
    }
    const posts: IPost[] | null = await Post.find({ topicId });
    await redisClient.set(`topicPosts:${topicId}`, JSON.stringify(posts), {
      EX: 900,
    });
    logger.info(`Posts for topic ${topicId} fetched from DB and cached`);
    res.status(200).json(posts);
  } catch (error) {
    logger.error('Error in getPostsForTopic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    logger.info(`Fetching post ${postId}`);
    const redisPost = await redisClient.get(`post:${postId}`);
    if (redisPost) {
      logger.info(`Post ${postId} fetched from cache`);
      res.status(200).json(JSON.parse(redisPost));
      return;
    }
    const post: IPost | null = await Post.findById(postId);
    if (!post) {
      logger.warn(`Post ${postId} not found`);
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    const topic = await Topic.findById(post.topicId);
    const tags = await Tag.find({ _id: { $in: post.tags } });
    const postObject = {
      id: post._id,
      title: post.title,
      content: post.content,
      likes: post.likes,
      topic: topic?.title,
      tags: tags.map((tag: ITag) => tag.title),
    };
    await redisClient.set(`post:${postId}`, JSON.stringify(postObject), {
      EX: 900,
    });
    logger.info(`Post ${postId} fetched from DB and cached`);
    res.status(200).json(postObject);
  } catch (error) {
    logger.error('Error in getPost:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    logger.info(`Attempting to delete post ${postId}`);
    const post: IPost | null = await Post.findById(postId);
    if (!post) {
      logger.warn(`Post ${postId} not found for deletion`);
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    await redisClient.del(`post:${postId}`);
    await redisClient.del('allPosts');
    await redisClient.del(`topicPosts:${post.topicId}`);
    await post.deleteOne();
    logger.info(`Post ${postId} deleted`);
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    logger.error('Error in deletePost:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    logger.info(`Liking post ${postId}`);
    const post: IPost | null = await Post.findById(postId);
    if (!post) {
      logger.warn(`Post ${postId} not found for liking`);
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    post.likes += 1;
    await post.save();
    const redisPost = await redisClient.get(`post:${postId}`);
    if (redisPost) {
      const parsedPost = JSON.parse(redisPost);
      parsedPost.likes = post.likes;
      await redisClient.set(`post:${postId}`, JSON.stringify(parsedPost), {
        EX: 900,
      });
      logger.info(`Post ${postId} cache updated with new like count`);
    }
    await redisClient.del('allPosts');
    await redisClient.del(`topicPosts:${post.topicId}`);
    logger.info(`Post ${postId} liked successfully`);
    res.status(200).json({ message: 'Post liked' });
  } catch (error) {
    logger.error('Error in likePost:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
