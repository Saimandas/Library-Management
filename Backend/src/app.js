import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './utils/errorHandler.js';
import cors from 'cors';
import readersRouter from './routes/readersRouter.js';
import adminRouter from './routes/adminRouter.js';
const app = express();
app.use(express.json({limit:"16kb"}));

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(cookieParser({
  
}));
app.use("/api/readers",readersRouter);
app.use("/api/admin",adminRouter);
app.use(errorHandler);
export default app;
