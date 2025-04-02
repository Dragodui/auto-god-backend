import { createClient } from 'redis';
import logger from '../utils/logger';
import {config} from "dotenv";
config();

const redisUrl = process.env.REDIS_URL!;

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (error) => {
  logger.error(`Redis error: ${error}`);
});

(async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to redis');
  } catch (error) {
    logger.error('Redis connection error:', error);
  }
})();

export default redisClient;
