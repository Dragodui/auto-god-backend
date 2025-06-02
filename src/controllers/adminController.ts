import { Request, Response } from 'express';
import Post from '../database/models/Post';
import Comment from '../database/models/Comment';
import News from '../database/models/News';
import logger from '../utils/logger';
import redisClient from '../database/redis';
import Event from '../database/models/Event';
import { IEvent } from '../types';

export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    await Post.findByIdAndDelete(postId);
    await Comment.deleteMany({ postId });
    await redisClient.del(`post:${postId}`);
    await redisClient.del('allPosts');
    await redisClient.del(`topicPosts:${post.topicId}`);
    logger.info(`Post ${postId} and its comments deleted by admin`);
    res.json({ message: 'Post and its comments deleted successfully' });
    return;
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
    return;
  }
};

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    await Comment.findByIdAndDelete(commentId);
    const postId = await Comment.findById(commentId).then(comment => comment?.postId);
    await redisClient.del(`comments:${postId}`);
    logger.info(`Comment ${commentId} deleted by admin`);
    res.json({ message: 'Comment deleted successfully' });
    return;
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
    return;
  }
};

export const deleteNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { newsId } = req.params;
    const news = await News.findById(newsId);
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }
    await News.findByIdAndDelete(newsId);
    await redisClient.del(`news:${newsId}`);
    await redisClient.del('allNews');
    await redisClient.del(`topicNews:${news.topicId}`);
    logger.info(`News ${newsId} deleted by admin`);
    res.json({ message: 'News deleted successfully' });
    return;
  } catch (error) {
    logger.error('Error deleting news:', error);
    res.status(500).json({ message: 'Error deleting news' });
    return;
  }
};

export const deleteEvent = async(req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    await Event.findByIdAndDelete(eventId);
    await redisClient.del(`event:${eventId}`);
    await redisClient.del('allEvents');
    logger.info(`Event ${eventId} deleted by admin`);
    res.json({ message: 'Event deleted successfully' });
    return;
  } catch (error) {
    logger.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
    return;
  }
}
export const acceptEvent = async(req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const event: IEvent | null = await Event.findByIdAndUpdate(eventId, {
      isAccepted: true,
    }, { new: true });
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    await redisClient.del(`event:${eventId}`);
    await redisClient.del('allEvents');
    await redisClient.del('allUnacceptedEvents');
    logger.info(`Event ${eventId} accepted by admin`);
    await event.save();
    res.json({ message: 'Event accepted successfully', event });
    return;
  } catch (error) {
    logger.error('Error accepting event:', error);
    res.status(500).json({ message: 'Error accepting event' });
    return;
  }
}

export const getUnacceptedEvents = async (req: Request, res: Response) => {
  try {
        const cachedEvents = await redisClient.get("allUnacceptedEvents");
        if (cachedEvents) {
            logger.info("Unaccepted events fetched from cache");
            res.status(200).json(JSON.parse(cachedEvents));
            return;
        }
        const events = await Event.find({isAccepted: false}).populate("authorId", "name avatar").sort({ createdAt: -1 });
        redisClient.set("allUnacceptedEvents", JSON.stringify(events), { EX: 900 });
        logger.info("Events fetched successfully");
        res.status(200).json(events);
        return;
    } catch (error) {
        logger.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}