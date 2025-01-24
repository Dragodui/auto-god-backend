import { Request, Response } from 'express';
import Post from '../database/models/Post';
import Topic from '../database/models/Topic';
import Tag from '../database/models/Tag';

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, content, tags, topicId } = req.body;
    if (!title || !content || !tags || !topicId) {
      res.status(400).json({ message: 'Please provide all fields' });
    }
    const userId = req.userId;
    const newPost = await Post.create({
      title,
      content,
      tags,
      topicId,
      authorId: userId,
    });
    await newPost.save();
    res.status(201).json({message: 'Post created'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostsForTopic = async(req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find({ topicId: req.params.topicId });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    const topic = await Topic.findById(post.topicId);
    const tags = await Tag.find({ _id: { $in: post.tags } });

    const postObject = {
      id: post._id,
      title: post.title,
      content: post.content,
      likes: post.likes,
      topic: topic?.title,
      tags: tags.map((tag) => tag.title),
    };
    res.status(200).json(postObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    post.likes += 1;
    await post.save();
    res.status(200).json({ message: 'Post liked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
