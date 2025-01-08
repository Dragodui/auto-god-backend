  import express, { Express, Response, Request } from 'express';
  import { config } from 'dotenv';
  import authRouter from './routes/auth';
  import MongoStore = require('connect-mongo');
  import session from 'express-session';
  import './database/index';
  import postRouter from './routes/posts';
  import cookieParser from 'cookie-parser';
  import cors from "cors";
import checkAuth from './utils/checkAuth';

  declare module 'express-session' {
    interface SessionData {
      user: {
        id: unknown;
        email: string;
      };
    }
  }

  config();

  const app: Express = express();

  app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true, 
    })
  );


  app.use(cookieParser());
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
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
  );
  app.use('/api/auth', authRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/protected', checkAuth, (req: Request, res: Response) => {
    res.json({ message: 'Protected route' });
  });

  app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
  });
