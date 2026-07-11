import { Application } from "express";
import apiRouter from "./api.route";


export const initRoutes = (app: Application) => {
    app.use('/api', apiRouter);
    app.use('/worker', apiRouter);
}
