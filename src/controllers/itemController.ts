import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Item, { IItem } from '../database/models/Item';
import { ensureUploadsDir } from '../utils/ensureUploadsDir';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, price } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'At least one photo is required' });
      return;
    }

    // Ensure uploads directory exists
    const uploadsDir = ensureUploadsDir();

    // Create relative paths for the photos
    const photoPaths = files.map((file) => {
      const relativePath = path.relative(process.cwd(), file.path);
      return relativePath.replace(/\\/g, '/'); // Convert Windows paths to URL format
    });

    const item = new Item({
      title,
      description,
      price,
      photos: photoPaths,
      seller: req.userId,
    });

    await item.save();
    res.status(201).json(item);
    return;
  } catch (error) {
    // Clean up any uploaded files if there's an error
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach((file) => {
        if (file.path) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        }
      });
    }
    res.status(500).json({ message: 'Error creating item', error });
    return;
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find({ status: 'available' })
      .populate('seller', 'name lastName email')
      .sort({ createdAt: -1 });
    res.json(items);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error });
    return;
  }
};

export const getUserItems = async(req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find({ seller: req.userId })
      .populate('seller', 'name lastName email')
      .sort({ createdAt: -1 });
    if (!items || items.length === 0) {
      res.status(404).json({ message: 'No items found for this user' });
      return;
    }
    res.status(200).json(items);
    return;
  } catch (error) {
    logger.error('Error fetching my items:', error);
    res.status(500).json({ message: 'Error fetching my items', error });
    return;
  }
}

export const getItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name lastName email')
      .populate('buyer', 'name lastName email');
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.json(item);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error });
    return;
  }
};

export const purchaseItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (item.status === 'sold') {
      res.status(400).json({ message: 'Item is already sold' });
      return;
    }

    if (item.seller.toString() === req.userId?.toString()) {
      res.status(400).json({ message: 'Cannot purchase your own item' });

      return;
    }

    item.status = 'sold';
    item.buyer = new mongoose.Types.ObjectId(req.userId!);
    await item.save();

    res.json({ message: 'Item purchased successfully', item });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing item', error });
  }
};

