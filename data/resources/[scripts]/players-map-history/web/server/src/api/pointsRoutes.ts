import { PlayersMapHistory } from "@shared/core";
import { PaginatedResult, PlayersMapHistoryModel } from "@shared/server";
import { Express } from "express";
import { TemplateRoutes } from "./templateRoutes";

export class PointsRoutes extends TemplateRoutes {
    private _playersMapHistoryModel: PlayersMapHistoryModel;

    constructor(app: Express) {
        super(app);

        this._playersMapHistoryModel = new PlayersMapHistoryModel();

        this._route<PaginatedResult<PlayersMapHistory>>("get", "/points", async (req) => {
            const { player, sessionId, from, to, page = "1", limit = "100" } = req.query;

            const pageNum = Math.max(1, parseInt(page as string, 10));
            const limitNum = Math.min(1000, Math.max(1, parseInt(limit as string, 10)));

            return this._playersMapHistoryModel.getPoints(
                {
                    player: player as string | undefined,
                    sessionId: sessionId ? parseInt(sessionId as string, 10) : undefined,
                    from: from ? new Date(from as string) : undefined,
                    to: to ? new Date(to as string) : undefined
                },
                pageNum,
                limitNum
            );
        });

        this._route<PlayersMapHistory[]>("get", "/points/live", async () => {
            return this._playersMapHistoryModel.getLivePoints();
        });
    }
}
