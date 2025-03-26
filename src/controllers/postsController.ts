import { Request, Response } from 'express';
import Post from '../database/models/Post';
import Topic from '../database/models/Topic';
import Tag from '../database/models/Tag';
import redisClient from '../database/redis';
import { IPost, ITag, ITopic } from '../types';
import logger from '../utils/logger';
import User from '../database/models/User';
import { Types } from "mongoose";

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
      likes: 0,
      views: 0,
      authorId: userId,
    });
    await newPost.save();
    await redisClient.del('allPosts');
    await redisClient.del(`topicPosts:${topicId}`);
    logger.info(`Post ${newPost._id} created by user ${userId}`);
    res.status(201).json({ message: 'Post created', post: newPost });
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

export const uploadPostImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const postId = req.params.id;
    if (!postId) {
      res.status(401).json({ message: 'No post id provided' });
      return;
    }
    const imagePath = req.file.path;
    let fileName = imagePath.split('\\uploads\\').pop();
    fileName = '/uploads/' + fileName;
    const post: IPost | null = await Post.findByIdAndUpdate(
      postId,
      { image: fileName },
      { new: true }
    );
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    logger.info(`new ${postId} updated image`);

    res.status(200).json({ message: 'Image uploaded', imagePath });
  } catch (error) {
    logger.error('Error in uploadNewsImage:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostsForTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const topicName = req.params.topicName;
    logger.info(`Fetching posts for topic ${topicName}`);
    // const redisPosts = await redisClient.get(`topicPosts:${topicName}`);
    // if (redisPosts) {
    //   logger.info(`Posts for topic ${topicName} fetched from cache`);
    //   res.status(200).json(JSON.parse(redisPosts));
    //   return;
    // }
    const topic: ITopic | null = await Topic.findOne({ title: topicName });
    if (!topic) {
      logger.warn(`Topic ${topicName} not found`);
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    const posts: IPost[] | null = await Post.find({ topicId: topic._id });
    await redisClient.set(`topicPosts:${topicName}`, JSON.stringify(posts), {
      EX: 900,
    });
    logger.info(`Posts for topic ${topicName} fetched from DB and cached`);
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
    const author = await User.findById(post.authorId).select('-password');
    const postObject = {
      id: post._id,
      title: post.title,
      content: post.content,
      likes: post.likes,
      views: post.views,
      image: post.image,
      topic: topic?.title,
      createdAt: post.createdAt,
      author: author,
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

    const userId = req.userId;
    if (!userId || userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (post.likes.includes(userId as any)) {
      logger.warn(`Post ${postId} already liked by user ${userId}`);
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      await post.save();
    } else {
      post.likes.push(new Types.ObjectId(userId));
      await post.save();
    }

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

export const viewPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    logger.info(`Viewing post ${postId}`);
    const post: IPost | null = await Post.findById(postId);
    if (!post) {
      logger.warn(`Post ${postId} not found for viewing`);
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.userId;
    console.log(post);
    if (post.views.includes(userId as any)) {
      logger.warn(`POst ${postId} already viewed by user ${userId}`);
      res.status(400).json({ message: 'News already viewed' });
      return;
    }
    post.views.push(req.userId as any);
    await post.save();

    const redisPost = await redisClient.get(`post:${postId}`);
    if (redisPost) {
      const parsedPost = JSON.parse(redisPost);
      parsedPost.likes = post.likes;
      await redisClient.set(`post:${postId}`, JSON.stringify(parsedPost), {
        EX: 900,
      });
      logger.info(`Post ${postId} cache updated with new view count`);
    }
    await redisClient.del('allPosts');
    await redisClient.del(`topicPosts:${post.topicId}`);
    logger.info(`News ${postId} liked successfully`);
    res.status(200).json({ message: 'News liked' });
  } catch (error) {
    logger.error('Error in viewPost:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
