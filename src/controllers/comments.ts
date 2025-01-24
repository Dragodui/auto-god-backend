import { Request, Response } from 'express';
import Comment from '../database/models/Comment';
import Post from '../database/models/Post';

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authorId = req.userId;
    const { content, postId } = req.body;
    if (!content || !postId) {
      res.status(400).json({ message: 'Please provide all fields' });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const { replyTo } = req.body;
    const newComment = await Comment.create({
      authorId,
      content,
      postId,
      replyTo: replyTo || null,
    });
    await newComment.save();
    res.status(201).json({ message: 'Comment created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};

export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId });
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};

export const likeComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    comment.likes += 1;
    await comment.save();
    res.status(200).json({ message: 'Comment liked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};
