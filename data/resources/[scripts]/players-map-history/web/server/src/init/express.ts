import cors from "cors";
import express, { Express } from "express";
import { HealthRoutes } from "../api/healthRoutes";
import { PointsRoutes } from "../api/pointsRoutes";
import { errorLoggerMiddleware, loggerMiddleware } from "../middlewares/logger";

export function initExpress(): Express {
    const app = express();

    app.use(express.json());
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || "http://localhost:4200",
            credentials: true
        })
    );
    app.use(loggerMiddleware);

    new HealthRoutes(app);
    new PointsRoutes(app);

    app.use(errorLoggerMiddleware);

    return app;
}
