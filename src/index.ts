import express, { Express } from 'express';
import { config } from 'dotenv';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './database/index';

//routes
import authRouter from './routes/auth';
import postRouter from './routes/posts';
import tagRouter from "./routes/tags";
import topicRoutes from "./routes/topics";

config();

const app: Express = express();

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

app.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
