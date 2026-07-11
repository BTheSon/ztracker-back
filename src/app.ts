import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { initRoutes } from './routes';

const app: Application = express();

// Middlewares
app.use(cors({
    origin: [
        "https://ztracker-back.onrender.com",
        "http://localhost:5173/",
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
initRoutes(app);

// Error Handler
app.use(errorHandler);

export default app;
