import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PlayersMapHistory } from "@shared/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { PointsResponse } from "../interfaces/point.interface";

export interface PointsFilter {
    player?: string;
    sessionId?: number;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

@Injectable({ providedIn: "root" })
export class ApiService {
    private _baseUrl = environment.apiUrl;

    constructor(private _http: HttpClient) {}

    getPoints(filters: PointsFilter = {}): Observable<PointsResponse> {
        let params = new HttpParams();

        if (filters.player) {
            params = params.set("player", filters.player);
        }
        if (filters.sessionId) {
            params = params.set("sessionId", filters.sessionId.toString());
        }
        if (filters.from) {
            params = params.set("from", filters.from);
        }
        if (filters.to) {
            params = params.set("to", filters.to);
        }
        if (filters.page) {
            params = params.set("page", filters.page.toString());
        }
        if (filters.limit) {
            params = params.set("limit", filters.limit.toString());
        }

        return this._http.get<PointsResponse>(`${this._baseUrl}/points`, { params });
    }

    getLivePoints(): Observable<PlayersMapHistory[]> {
        return this._http.get<PlayersMapHistory[]>(`${this._baseUrl}/points/live`);
    }
}
