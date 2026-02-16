import { PlayersMapHistory } from "@shared/core";

export interface PointsResponse {
    data: PlayersMapHistory[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
