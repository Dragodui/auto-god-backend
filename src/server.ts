import express, { Express } from 'express';
import { config } from 'dotenv';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import './database/index';

//routes
import authRouter from './routes/authRoute';
import postRouter from './routes/postsRoute';
import tagRouter from './routes/tagsRoute';
import topicRoutes from './routes/topicsRoute';
import newsRoutes from './routes/newsRoute';
import commentRoutes from './routes/commentsRoute';
import carRoutes from './routes/carRoute';
import userRoutes from './routes/userRoute';
import statsRoutes from './routes/statsRoute';
import adminRoutes from './routes/adminRoute';
// redis
import redisClient from './database/redis';
//logger
import logger from './utils/logger';

config();

const app: Express = express();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(express.json());
const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_NAME}.jnmyg7a.mongodb.net/${process.env.DB_NAME}`,
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
app.use('/api/admin', adminRoutes);

app.listen(process.env.PORT, () => {
  logger.info('Server is running on port ' + process.env.PORT);
});
