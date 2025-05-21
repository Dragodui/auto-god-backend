import mongoose from 'mongoose';
import logger from '../utils/logger';
import { config } from 'dotenv';
config();

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_NAME}.jnmyg7a.mongodb.net/${process.env.DB_NAME}`
  )
  .then(() => logger.info('Connected to the database'))
  .catch((error) =>
    logger.info(`Error while connecting to the database ${error}`)
  );
