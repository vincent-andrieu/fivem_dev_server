import { Express, Request, Response, Router } from "express";

type RouteHandler<ResBody> = (req: Request, res: Response) => Promise<ResBody> | ResBody;

export abstract class TemplateRoutes {
    protected _router: Router;

    constructor(app: Express) {
        this._router = Router();
        app.use(this._router);
    }

    protected _route<ResBody>(method: "get" | "post" | "put" | "delete", path: string, handler: RouteHandler<ResBody>): void {
        this._router[method](path, async (req: Request, res: Response) => {
            try {
                const result = await handler(req, res);
                if (result !== undefined && !res.headersSent) {
                    res.json(result);
                }
            } catch (error) {
                if (!res.headersSent) {
                    const message = error instanceof Error ? error.message : String(error);

                    console.error(`Route error [${method.toUpperCase()} ${path}]:`, message);
                    res.status(500).json({ error: message });
                }
            }
        });
    }
}
