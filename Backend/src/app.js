import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './utils/errorHandler.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import readersRouter from './routes/readersRouter.js';
import adminRouter from './routes/adminRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, '..', 'uploads')));

app.use("/api/readers", readersRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

export default app;
