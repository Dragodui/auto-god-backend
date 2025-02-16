import express, { Express } from 'express';
import { config } from 'dotenv';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import './database/index';

//routes
import authRouter from './routes/auth';
import postRouter from './routes/posts';
import tagRouter from './routes/tags';
import topicRoutes from './routes/topics';
import newsRoutes from './routes/news';
import commentRoutes from './routes/comments';
import carRoutes from './routes/car';
import userRoutes from './routes/user';
import statsRoutes from './routes/stats';
// redis
import redisClient from './database/redis';
//logger
import logger from './utils/logger';

config();

const app: Express = express();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(express.json());
const mongoStore = MongoStore.create({
  mongoUrl: 'mongodb://127.0.0.1:27017/auto-god',
});

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { secure: false },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_HOST || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/tags', tagRouter);
app.use('/api/topics', topicRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/car', carRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stats', statsRoutes);

app.listen(process.env.PORT, () => {
  logger.info('Server is running on port ' + process.env.PORT);
});
