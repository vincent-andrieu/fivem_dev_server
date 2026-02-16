import { Request, Response, NextFunction } from "express";

const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;

export function loggerMiddleware(req: Request, _res: Response, next: NextFunction): void {
    console.log(`${yellow(req.method)} ${green(req.url)}`);
    next();
}

export function errorLoggerMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
    console.error(`${red(req.method)} ${cyan("ERROR")} ${req.url} ${red(err.message)}`);
    res.status(500).json({ error: "Internal server error" });
}
