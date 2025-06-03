import { Request, Response } from 'express';
import User from '../database/models/User';
import { IComment, IPost, IUser } from '../types';
import Comment from '../database/models/Comment';
import logger from '../utils/logger';
import Post from '../database/models/Post';
import redisClient from '../database/redis';
import comparePasswords from '../utils/comparePasswords';
import { hashPassword } from '../utils/hashPassword';
import mongoose from 'mongoose';

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

    // Get last 3 comments by user
    const lastActivityComments: IComment[] = await Comment.find({
      authorId: userId,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    // Extract post IDs (as strings, not objects)
    const postIds: string[] = lastActivityComments.map((comment: IComment) => 
      comment.postId.toString()
    );

    // Get posts for those IDs
    const posts = await Post.find({
      _id: { $in: postIds }
    });

    // Build activity array
    const lastActivityPosts: IActivity[] = posts.map(post => {
      const relatedComment = lastActivityComments.find(
        (comment: IComment) => comment.postId.toString() === (post._id as string).toString()
      );
      
      return {
        post: post,
        comment: relatedComment || '',
      };
    });

    res.status(200).json({ lastActivityPosts });
  } catch (error) {
    logger.error('Error getting user last activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserLastActivityOptimized = async (req: Request, res: Response) => {
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

    const lastActivityPosts = await Comment.aggregate([
      {
        $match: { authorId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 3
      },
      {
        $lookup: {
          from: 'posts', 
          localField: 'postId',
          foreignField: '_id',
          as: 'post'
        }
      },
      {
        $unwind: '$post'
      },
      {
        $project: {
          post: '$post',
          comment: {
            _id: '$_id',
            content: '$content',
            createdAt: '$createdAt',
            authorId: '$authorId',
            postId: '$postId'
          }
        }
      }
    ]);

    res.status(200).json({ lastActivityPosts });
  } catch (error) {
    logger.error('Error getting user last activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
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
};

export const changePassword = async(req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ message: 'Old and new passwords are required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await comparePasswords(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Old password is incorrect' });
      return;
    }

    user.password = await hashPassword(newPassword);
    await user.save();
    
    await redisClient.del(`userInfo:${userId}`);
    logger.info(`User ${userId} changed password`);
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });  
  }
}