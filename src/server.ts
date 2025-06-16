// server.ts
import express, { Express } from 'express';
import { config } from 'dotenv';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import './database/index';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ensureUploadsDir } from './utils/ensureUploadsDir';

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
import itemRoutes from './routes/itemsRoute';
import chatRoutes from './routes/chatRoute';
import eventsRoutes from './routes/eventsRoute';
import notificationRoutes from './routes/notificationsRoute';
// redis
import redisClient from './database/redis';
//logger
import logger from './utils/logger';
import { verifyEmailConnection } from './middleware/mailer';

config();

const app: Express = express();
const httpServer = createServer(app);
const allowedOrigins = [
  'http://localhost:5173',
  'http://26.162.105.70:5173' 
];
// Configure Socket.IO with proper CORS settings
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true, // This is crucial!
  },
  allowEIO3: true, // Optional: for backward compatibility
});

app.use(express.json());
const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI!,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// Configure CORS properly for Express
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
app.use('/api/items', itemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notifications', notificationRoutes);

// Ensure uploads directory exists
ensureUploadsDir();

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    logger.info(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    logger.info(`User ${socket.id} left chat ${chatId}`);
  });

  socket.on('join-notifications', (userId) => {
    socket.join(`notifications:${userId}`);
    logger.info(`User ${socket.id} joined notifications room for user ${userId}`);
  });

  socket.on('leave-notifications', (userId) => {
    socket.leave(`notifications:${userId}`);
    logger.info(`User ${socket.id} left notifications room for user ${userId}`);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

verifyEmailConnection();

// Connect to MongoDB
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});