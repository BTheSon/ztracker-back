import { Application } from "express";
import apiRouter from "./api.route";
import pushRoutes from "./push.routes";


export const initRoutes = (app: Application) => {
    app.get("/", (_, res) => {
        res.send("OK");
    });
    app.use('/api', apiRouter);
    app.use('/worker', apiRouter);
    app.use('/push', pushRoutes);
}
