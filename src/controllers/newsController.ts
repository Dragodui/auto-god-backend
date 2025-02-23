import { Request, Response } from 'express';
import News from '../database/models/News';
import Topic from '../database/models/Topic';
import Tag from '../database/models/Tag';
import redisClient from '../database/redis';
import { INews, ITag } from '../types';
import logger from '../utils/logger';

export const createNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, content, tags, topicId } = req.body;
    if (!title || !content || !tags || !topicId) {
      logger.warn('Missing fields in createNews request');
      res.status(400).json({ message: 'Please provide all fields' });
      return;
    }
    const userId = req.userId;
    logger.info(`User ${userId} is creating a news in topic ${topicId}`);
    const newNews: INews = await News.create({
      title,
      content,
      tags,
      topicId,
      authorId: userId,
    });
    await newNews.save();
    await redisClient.del('allNews');
    await redisClient.del(`topicNews:${topicId}`);
    logger.info(`News ${newNews._id} created by user ${userId}`);
    res.status(201).json({ message: 'News created' });
  } catch (error) {
    logger.error('Error in createNews:', error);
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
    const topicId = req.params.topicId;
    logger.info(`Fetching news for topic ${topicId}`);
    const redisNews = await redisClient.get(`topicNews:${topicId}`);
    if (redisNews) {
      logger.info(`News for topic ${topicId} fetched from cache`);
      res.status(200).json(JSON.parse(redisNews));
      return;
    }
    const news: INews[] | null = await News.find({ topicId });
    await redisClient.set(`topicNews:${topicId}`, JSON.stringify(news), {
      EX: 900,
    });
    logger.info(`News for topic ${topicId} fetched from DB and cached`);
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
    const newsObject = {
      id: news._id,
      title: news.title,
      content: news.content,
      likes: news.likes,
      topic: topic?.title,
      tags: tags.map((tag: ITag) => tag.title),
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
    logger.info(`Liking news ${newsId}`);
    const news: INews | null = await News.findById(newsId);
    if (!news) {
      logger.warn(`News ${newsId} not found for liking`);
      res.status(404).json({ message: 'News not found' });
      return;
    }
    news.likes += 1;
    await news.save();
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
