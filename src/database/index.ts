import mongoose from 'mongoose';
import logger from '../utils/logger';
import { config } from 'dotenv';
config();

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-god')
  .then(() => logger.info('Connected to the database'))
  .catch((error) =>
    logger.info(`Error while connecting to the database ${error}`)
  );
