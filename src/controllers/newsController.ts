import { Request, Response } from 'express';
import News from '../database/models/News';
import Topic from '../database/models/Topic';
import Tag from '../database/models/Tag';
import redisClient from '../database/redis';
import { INews, ITag, ITopic } from '../types';
import logger from '../utils/logger';
import User from '../database/models/User';
import {Types} from 'mongoose';

export const createNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, content, tags, topicId, isMarkDown } = req.body;

    if (!title || !content || !tags || !topicId) {
      res.status(400).json({ message: 'Please provide all fields' });
      return;
    }

    const newNews = await News.create({
      title,
      content,
      tags,
      topicId,
      authorId: req.userId,
      isMarkDown,
    });
    await redisClient.del('allNews');
    await redisClient.del(`topicNews:${topicId}`);
    await newNews.save();
    res
      .status(201)
      .json({ message: 'News created successfully', news: newNews });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadNewsImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const newsId = req.params.id;
    if (!newsId) {
      res.status(401).json({ message: 'No news id provided' });
      return;
    }
    const imagePath = req.file.path;
    let fileName = imagePath.split('\\uploads\\').pop();
    fileName = '/uploads/' + fileName;
    const news: INews | null = await News.findByIdAndUpdate(
      newsId,
      { image: fileName },
      { new: true }
    );
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }

    logger.info(`new ${newsId} updated image`);

    res.status(200).json({ message: 'Image uploaded', imagePath });
  } catch (error) {
    logger.error('Error in uploadNewsImage:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all news');
    const redisNews = await redisClient.get('allNews');
    if (redisNews) {
      logger.info('News fetched from cache');
      res.status(200).json(JSON.parse(redisNews));
      return;
    }
    const news: INews[] | null = await News.find();
    await redisClient.set('allNews', JSON.stringify(news), { EX: 900 });
    logger.info('News fetched from DB and cached');
    res.status(200).json(news);
  } catch (error) {
    logger.error('Error in getNews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNewsForTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const topicName = req.params.topicName;
    logger.info(`Fetching news for topic ${topicName}`);
    const redisNews = await redisClient.get(`topicNews:${topicName}`);
    if (redisNews) {
      logger.info(`News for topic ${topicName} fetched from cache`);
      res.status(200).json(JSON.parse(redisNews));
      return;
    }
    const topic: ITopic | null = await Topic.findOne({ title: topicName });
    if (!topic) {
      logger.warn(`Topic ${topicName} not found`);
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    const news: INews[] | null = await News.find({ topicId: topic._id });

    await redisClient.set(`topicNews:${topicName}`, JSON.stringify(news), {
      EX: 900,
    });
    logger.info(`News for topic ${topicName} fetched from DB and cached`);
    res.status(200).json(news);
  } catch (error) {
    logger.error('Error in getNewsForTopic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOneNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newsId = req.params.id;
    logger.info(`Fetching news ${newsId}`);
    const redisNews = await redisClient.get(`news:${newsId}`);
    if (redisNews) {
      logger.info(`News ${newsId} fetched from cache`);
      res.status(200).json(JSON.parse(redisNews));
      return;
    }
    const news: INews | null = await News.findById(newsId);
    if (!news) {
      logger.warn(`News ${newsId} not found`);
      res.status(404).json({ message: 'News not found' });
      return;
    }
    const topic = await Topic.findById(news.topicId);
    const tags = await Tag.find({ _id: { $in: news.tags } });
    const author = await User.findById(news.authorId).select('-password');
    const newsObject = {
      id: news._id,
      title: news.title,
      content: news.content,
      likes: news.likes,
      topic: topic?.title,
      views: news.views,
      author: author,
      isMarkDown: news.isMarkDown,
      image: news.image,
      tags: tags.map((tag: ITag) => tag.title),
      createdAt: news.createdAt,
    };
    await redisClient.set(`news:${newsId}`, JSON.stringify(newsObject), {
      EX: 900,
    });
    logger.info(`News ${newsId} fetched from DB and cached`);
    res.status(200).json(newsObject);
  } catch (error) {
    logger.error('Error in getNews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newsId = req.params.id;
    logger.info(`Attempting to delete news ${newsId}`);
    const news: INews | null = await News.findById(newsId);
    if (!news) {
      logger.warn(`News ${newsId} not found for deletion`);
      res.status(404).json({ message: 'News not found' });
      return;
    }
    await redisClient.del(`news:${newsId}`);
    await redisClient.del('allNews');
    await redisClient.del(`topicNews:${news.topicId}`);
    await news.deleteOne();
    logger.info(`News ${newsId} deleted`);
    res.status(200).json({ message: 'News deleted' });
  } catch (error) {
    logger.error('Error in deleteNews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const likeNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsId = req.params.id;
    console.log(newsId);
    logger.info(`Liking news ${newsId}`);
    const news: INews | null = await News.findById(newsId);
    if (!news) {
      logger.warn(`News ${newsId} not found for liking`);
      res.status(404).json({ message: 'News not found' });
      return;
    }
    const userId = req.userId;
    if (!userId || userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (news.likes.includes(userId as any)) {
      logger.warn(`News ${newsId} already liked by user ${userId}`);
      news.likes = news.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      await news.save();
    } else {
      news.likes.push(new Types.ObjectId(userId));
      await news.save();
    }
    const redisNews = await redisClient.get(`news:${newsId}`);
    if (redisNews) {
      const parsedNews = JSON.parse(redisNews);
      parsedNews.likes = news.likes;
      await redisClient.set(`news:${newsId}`, JSON.stringify(parsedNews), {
        EX: 900,
      });
      logger.info(`News ${newsId} cache updated with new like count`);
    }
    await redisClient.del('allNews');
    await redisClient.del(`topicNews:${news.topicId}`);
    logger.info(`News ${newsId} liked successfully`);
    res.status(200).json({ message: 'News liked' });
  } catch (error) {
    logger.error('Error in likeNews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const viewNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsId = req.params.id;
    logger.info(`Viewing news ${newsId}`);
    const news: INews | null = await News.findById(newsId);
    if (!news) {
      logger.warn(`News ${newsId} not found for view`);
      res.status(404).json({ message: 'News not found' });
      return;
    }

    const userId = req.userId;
    if (news.views.includes(userId as any)) {
      logger.warn(`News ${newsId} already viewed by user ${userId}`);
      res.status(400).json({ message: 'News already viewed' });
      return;
    }
    news.views.push(req.userId as any);
    await news.save();

    const redisNews = await redisClient.get(`news:${newsId}`);
    if (redisNews) {
      const parsedNews = JSON.parse(redisNews);
      parsedNews.likes = news.likes;
      await redisClient.set(`news:${newsId}`, JSON.stringify(parsedNews), {
        EX: 900,
      });
      logger.info(`News ${newsId} cache updated with new view count`);
    }
    await redisClient.del('allNews');
    await redisClient.del(`topicNews:${news.topicId}`);
    logger.info(`News ${newsId} view successfully`);
    res.status(200).json({ message: 'News viewed' });
  } catch (error) {
    logger.error('Error in viewNews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
