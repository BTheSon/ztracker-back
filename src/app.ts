import express, { Application } from 'express';
import cors from 'cors';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Error Handler
app.use(errorHandler);

export default app;
