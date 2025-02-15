import mongoose from 'mongoose';
import logger from '../utils/logger';

mongoose
  .connect('mongodb://127.0.0.1:27017/auto-god')
  .then(() => logger.info('Connected to the database'))
  .catch((error) =>
    logger.info(`Error while connecting to the database ${error}`)
  );
