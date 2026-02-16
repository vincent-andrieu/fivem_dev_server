import { PlayersMapHistory } from "@shared/core";
import { RootFilterQuery } from "mongoose";
import playersMapHistorySchema from "../schemas/playersMapHistorySchema";
import { toObjectId } from "../utils";
import TemplateModel from "./templateModel";

export interface PointsFilter {
    player?: string;
    sessionId?: number;
    from?: Date;
    to?: Date;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export default class PlayersMapHistoryModel extends TemplateModel<PlayersMapHistory> {
    constructor() {
        super(PlayersMapHistory, "players_map_history", playersMapHistorySchema);
    }

    public async getPoints(filter: PointsFilter, page: number, limit: number): Promise<PaginatedResult<PlayersMapHistory>> {
        const mongoFilter: RootFilterQuery<unknown> = {};

        if (filter.player) {
            mongoFilter.player = toObjectId(filter.player);
        }
        if (filter.sessionId !== undefined) {
            mongoFilter.sessionId = filter.sessionId;
        }
        if (filter.from || filter.to) {
            mongoFilter.createdAt = {};
            if (filter.from) {
                mongoFilter.createdAt.$gte = filter.from;
            }
            if (filter.to) {
                mongoFilter.createdAt.$lte = filter.to;
            }
        }

        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
            this._model.find(mongoFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("player"),
            this._model.countDocuments(mongoFilter)
        ]);

        return {
            data: results.map((doc) => new PlayersMapHistory(doc.toObject<PlayersMapHistory>())),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        };
    }

    public async getLivePoints(): Promise<PlayersMapHistory[]> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const results = await this._model.aggregate([
            { $match: { createdAt: { $gte: fiveMinutesAgo } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$sessionId",
                    lastSessionPoint: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$lastSessionPoint" } },
            {
                $lookup: {
                    from: "players",
                    localField: "player",
                    foreignField: "_id",
                    as: "player"
                }
            },
            { $unwind: { path: "$player", preserveNullAndEmptyArrays: true } }
        ]);

        return results.map((doc) => new PlayersMapHistory(doc));
    }
}
