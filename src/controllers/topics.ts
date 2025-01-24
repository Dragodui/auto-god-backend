import { Request, Response } from 'express';
import Topic from '../database/models/Topic';

export const getAllTopics = async (req: Request, res: Response): Promise<void> => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getTopic = async (req: Request, res: Response): Promise<void> => {
    try {
        const topic = await Topic.findById(req.params.topicId);
        res.status(200).json(topic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}