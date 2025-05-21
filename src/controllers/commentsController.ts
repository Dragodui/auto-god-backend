import { Request, Response } from 'express';
import Comment from '../database/models/Comment';
import Post from '../database/models/Post';
import redisClient from '../database/redis';
import logger from '../utils/logger';
import { IComment, INews, IPost } from '../types';
import New from '../database/models/News';
import User from '../database/models/User';
import { Types } from 'mongoose';

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authorId = req.userId;
    const { content, postId, replyTo } = req.body;

    logger.info(
      `Attempting to create comment by user ${authorId} on post ${postId}`
    );

    if (!content || !postId) {
      logger.warn('Not all fields provided for creating comment');
      res.status(400).json({ message: 'Please provide all fields' });
      return;
    }

    const post: IPost | null = await Post.findById(postId);
    let news: INews | null = null;
    if (!post) {
      news = await New.findById(postId);
      if (!news) {
        logger.warn(`Post not found (ID: ${postId})`);
        res.status(404).json({ message: 'Post not found' });
        return;
      }
    }

    const newComment: IComment = await Comment.create({
      authorId,
      content,
      postId,
      replyTo: replyTo || null,
    });
    await newComment.save();

    await redisClient.del(`postComments:${postId}`);

    logger.info(`Comment created (ID: ${newComment._id}) for post ${postId}`);
    res.status(201).json({ message: 'Comment created', newComment });
  } catch (error) {
    logger.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.postId;
    logger.info(`Fetching comments for post ${postId}`);

    const cachedComments = await redisClient.get(`postComments:${postId}`);
    if (cachedComments) {
      logger.info(`Comments for post ${postId} fetched from cache`);
      res.status(200).json(JSON.parse(cachedComments));
      return;
    }

    const comments: IComment[] | null = await Comment.find({ postId });
    if (!comments) {
      logger.warn(`No comments found for post ${postId}`);
      res.status(404).json({ message: 'No comments found' });
      return;
    }

    let parsedComments: IComment[] = JSON.parse(JSON.stringify(comments));

    for (let comment of parsedComments) {
      const author = await User.findById(comment.authorId).select('-password');
      if (author) comment.author = author;
    }

    await redisClient.set(
      `postComments:${postId}`,
      JSON.stringify(parsedComments),
      {
        EX: 300,
      }
    );

    logger.info(
      `Comments for post ${postId} cached (count: ${parsedComments.length})`
    );
    res.status(200).json(parsedComments);
  } catch (error) {
    logger.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const likeComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    logger.info(`Liking comment ${id}`);

    const comment: IComment | null = await Comment.findById(id);
    if (!comment) {
      logger.warn(`Comment not found (ID: ${id})`);
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    const userId = req.userId;
    if (!userId || userId === undefined) {
      logger.warn('Unauthorized access to like comment');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (comment.likes.includes(userId as any)) {
      logger.warn(`Comment ${id} already liked by user ${userId}`);
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      comment.likes.push(new Types.ObjectId(userId));
      await comment.save();
    }

    await redisClient.del(`postComments:${comment.postId}`);

    logger.info(`Comment ${id} liked, total likes: ${comment.likes}`);
    res.status(200).json({ message: 'Comment liked' });
  } catch (error) {
    logger.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
