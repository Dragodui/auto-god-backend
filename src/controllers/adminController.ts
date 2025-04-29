import { Request, Response } from 'express';
import Post from '../database/models/Post';
import Comment from '../database/models/Comment';
import News from '../database/models/News';
import logger from '../utils/logger';

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    await Post.findByIdAndDelete(postId);
    await Comment.deleteMany({ postId });
    logger.info(`Post ${postId} and its comments deleted by admin`);
    res.json({ message: 'Post and its comments deleted successfully' });
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    logger.info(`Comment ${commentId} deleted by admin`);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { newsId } = req.params;
    await News.findByIdAndDelete(newsId);
    logger.info(`News ${newsId} deleted by admin`);
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    logger.error('Error deleting news:', error);
    res.status(500).json({ message: 'Error deleting news' });
  }
}; 