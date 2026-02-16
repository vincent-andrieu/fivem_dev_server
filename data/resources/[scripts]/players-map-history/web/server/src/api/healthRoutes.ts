import { Express } from "express";
import { TemplateRoutes } from "./templateRoutes";

export class HealthRoutes extends TemplateRoutes {
    constructor(app: Express) {
        super(app);

        this._route<{ status: string }>("get", "/health", async () => {
            return { status: "ok" };
        });
    }
}
