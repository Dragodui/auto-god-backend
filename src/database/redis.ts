import { createClient } from 'redis';
import logger from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

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
