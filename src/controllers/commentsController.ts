import { Request, Response } from 'express';
import Comment from '../database/models/Comment';
import Post from '../database/models/Post';
import redisClient from '../database/redis';
import logger from '../utils/logger';
import { IComment, INews, IPost } from '../types';
import New from '../database/models/News';

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

    const comments: IComment[] | null = await Comment.find({ postId });
    if (!comments) {
      logger.warn(`No comments found for post ${postId}`);
      res.status(404).json({ message: 'No comments found' });
      return;
    }

    await redisClient.set(`postComments:${postId}`, JSON.stringify(comments), {
      EX: 300,
    });

    logger.info(
      `Comments for post ${postId} cached (count: ${comments.length})`
    );
    res.status(200).json(comments);
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

    comment.likes += 1;
    await comment.save();

    await redisClient.del(`postComments:${comment.postId}`);

    logger.info(`Comment ${id} liked, total likes: ${comment.likes}`);
    res.status(200).json({ message: 'Comment liked' });
  } catch (error) {
    logger.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
