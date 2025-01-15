import express, { Express, Response, Request } from 'express';
import { config } from 'dotenv';
import authRouter from './routes/auth';
import MongoStore = require('connect-mongo');
import session from 'express-session';
import './database/index';
import postRouter from './routes/posts';
import cors from 'cors';

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
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}
));

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

app.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
