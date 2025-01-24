import { Request, Response } from 'express';
import Tag from '../database/models/Tag';
import Post from '../database/models/Post';

export const getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const tags = await Tag.find();
        res.status(200).json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getPostTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const tags = await Tag.find({ _id: { $in: post.tags } });
        res.status(200).json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}