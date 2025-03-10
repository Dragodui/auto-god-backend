import { Request, Response } from 'express';
import User from '../database/models/User';
import { IComment, IPost, IUser } from '../types';
import Comment from '../database/models/Comment';
import logger from '../utils/logger';
import Post from '../database/models/Post';
import redisClient from '../database/redis';

interface IActivity {
  post: IPost;
  comment: IComment | string;
}

export const updateUserAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const avatarPath: string = req.file.path;
    let fileName = avatarPath.split('\\uploads\\').pop();
    fileName = '/uploads/' + fileName;

    await redisClient.del(`userInfo:${userId}`);
    logger.info(`User ${userId} cache deleted`);

    const user: IUser | null = await User.findByIdAndUpdate(
      userId,
      { avatar: fileName },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    logger.info(`User ${userId} updated avatar`);
    res.status(200).json({ message: 'Avatar updated', avatar: avatarPath });
  } catch (error) {
    logger.error('Error updating user avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserData = async (req: Request, res: Response) => {
  try {
    const { name, lastName, nickname, car } = req.body;
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await User.findByIdAndUpdate(userId, {
      name,
      lastName,
      nickname,
      car,
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    await user.save();
    await redisClient.del(`userInfo:${userId}`);
    logger.info(`User ${userId} updated data`);
    res.status(200).json({ message: 'User data updated', user });
  } catch (error) {
    logger.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserLastActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const lastActivityComments: IComment[] = await Comment.find({
      authorId: userId,
    })
      .sort({ createdAt: -1 })
      .limit(3);
    const lastActivityCommentsIds: { postId: string }[] =
      lastActivityComments.map((comment: IComment) => ({
        postId: comment.postId.toString(),
      }));
    let lastActivityPosts: IActivity[] = [];
    for (let id of lastActivityCommentsIds) {
      const post = await Post.findById(id);
      if (post) {
        lastActivityPosts.push({
          post: post,
          comment:
            lastActivityComments.find(
              (comment: IComment) => comment.postId.toString() === id.postId
            ) || '',
        });
      }
    }
    res.status(200).json({ lastActivityPosts });
  } catch (error) {
    logger.error('Error getting user last activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    console.log(req.params)
    const userId = req.params.id;
    console.log(userId)
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error getting user by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
}