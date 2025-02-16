import { Request, Response } from "express"
import logger from "../utils/logger"
import User from "../database/models/User";
import Topic from "../database/models/Topic";
import Post from "../database/models/Post";
import News from "../database/models/News";

export const getStats = async(req: Request, res: Response) => {
    try {
        const users = await User.find().countDocuments();
        const topics = await Topic.find().countDocuments();
        const posts = await Post.find().countDocuments();
        const news = await News.find().countDocuments();
        const stats = { users, topics, posts, news };
        res.status(200).json(stats);
    } catch (error) {
        logger.error('Error getting stats:', error) ;
        res.status(500).json({ message: 'Server error' });
    }
}