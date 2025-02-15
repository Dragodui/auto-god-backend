import { Request, Response } from 'express';
import logger from '../utils/logger';
import Car from '../database/models/Car';
import { ICar } from '../interfaces';

export const addCar = async (req: Request, res: Response) => {
  try {
    logger.info('Adding a new car');

    const { make, carModel, year, description } = req.body;
    const userId = req.userId;

    if (!make || !carModel || !year || !description) {
      logger.warn('Not all fields provided for adding a car');
      res.status(400).json({ message: 'Please provide all fields' });
      return;
    }
    if (!userId) {
      logger.warn('User not authenticated');
      res.status(401).json({ message: 'Please authenticate' });
      return;
    }
    const car: ICar = new Car({
      ownerId: userId,
      make,
      carModel,
      year,
      description,
    });
    res.status(200).json({ message: 'Car added', car });
  } catch (error) {
    logger.error('Error adding car:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeCar = async (req: Request, res: Response) => {
  try {
    logger.info('Changing car details');
    const { make, carModel, year, description } = req.body;
    const userId = req.userId;
    const car = await Car.findOne({ ownerId: userId });
    if (!car) {
      logger.warn('Car not found');
      res.status(404).json({ message: 'Car not found' });
      return;
    }
    car.make = make || car.make;
    car.carModel = carModel || car.carModel;
    car.year = year || car.year;
    car.description = description || car.description;
    await car.save();
    res.status(200).json({ message: 'Car details changed', car });
  } catch (error) {
    logger.error('Error changing car details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
