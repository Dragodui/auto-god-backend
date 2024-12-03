import { Request, Response } from 'express';
import Post from '../database/models/Post';
import { IPost } from '../interfaces';

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, content, userId } = req.body;
    // const userId = req.session.id;
    if (!title || !content || !userId) {
      res.status(400).json({ message: 'Please provide all fields' });
    }
    const newPost = await Post.create({
      title,
      content,
      authorId: userId,
    });
    await newPost.save();
    console.log('New post created!');
  } catch (error) {
    console.error(error);
  }
};
