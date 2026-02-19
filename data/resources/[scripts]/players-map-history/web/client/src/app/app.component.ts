import { Component, computed, effect, OnDestroy, signal } from "@angular/core";
import { Player, PlayersMapHistory } from "@shared/core";
import { MapComponent } from "./map/map.component";
import { ApiService, PointsFilter } from "./shared/services/api.service";
import { WebSocketService } from "./shared/services/websocket.service";
import { SidebarComponent } from "./sidebar/sidebar.component";

export const DEFAULT_FROM_FILTER_HOURS = 12;

@Component({
    selector: "app-root",
    standalone: true,
    imports: [MapComponent, SidebarComponent],
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnDestroy {
    points = signal<PlayersMapHistory[]>([]);
    visiblePlayers = signal<Set<string>>(new Set());
    players = computed(() => {
        const seen = new Map<string, Player>();

        for (const point of this.points()) {
            const player = point.player as Player;

            if (player?._id && !seen.has(player._id)) {
                seen.set(player._id, player);
            }
        }
        return Array.from(seen.values());
    });

    private _liveMode = false;
    private _currentFilters: PointsFilter = {};
    private _fromHoursAgo = DEFAULT_FROM_FILTER_HOURS;
    private _liveInterval: ReturnType<typeof setInterval> | null = null;

    constructor(
        private _apiService: ApiService,
        private _wsService: WebSocketService
    ) {
        effect(() => {
            const newPoint = this._wsService.lastPoint();
            if (newPoint && this._liveMode) {
                this.points.update((current) => [...current, new PlayersMapHistory(newPoint)]);
            }
        });

        this._loadPoints();
    }

    ngOnDestroy(): void {
        this._stopLivePruning();
    }

    onVisiblePlayersChange(playerIds: Set<string>): void {
        this.visiblePlayers.set(playerIds);
    }

    onFiltersChange(filters: { from?: string; to?: string }): void {
        this._currentFilters = { ...this._currentFilters, ...filters };

        if (filters.from) {
            this._fromHoursAgo = (Date.now() - new Date(filters.from).getTime()) / (60 * 60 * 1000);
        }

        if (this._liveMode) {
            this._loadLivePoints();
        } else {
            this._loadPoints();
        }
    }

    onLiveModeChange(live: boolean): void {
        this._liveMode = live;

        if (live) {
            this._wsService.connect();
            this._startLivePruning();
            delete this._currentFilters.to;
            this._loadLivePoints();
        } else {
            this._wsService.disconnect();
            this._stopLivePruning();
        }
    }

    private _loadLivePoints(): void {
        const from = new Date(Date.now() - this._fromHoursAgo * 60 * 60 * 1000).toISOString();

        this._apiService.getPoints({ from, limit: 1000 }).subscribe((response) => {
            this.points.set(response.data.map((point) => new PlayersMapHistory(point)));
        });
    }

    private _startLivePruning(): void {
        this._stopLivePruning();

        this._liveInterval = setInterval(() => {
            const cutoff = Date.now() - this._fromHoursAgo * 60 * 60 * 1000;

            this.points.update((current) =>
                current.filter((point) => {
                    const createdAt = (point as any)._createdAt as string | undefined;
                    return !createdAt || new Date(createdAt).getTime() >= cutoff;
                })
            );
        }, 60_000);
    }

    private _stopLivePruning(): void {
        if (this._liveInterval !== null) {
            clearInterval(this._liveInterval);
            this._liveInterval = null;
        }
    }

    private _loadPoints(): void {
        if (this._liveMode) {
            return;
        }

        const filters: PointsFilter = {
            ...this._currentFilters,
            limit: 1000
        };

        if (!filters.from) {
            filters.from = new Date(Date.now() - DEFAULT_FROM_FILTER_HOURS * 60 * 60 * 1000).toISOString();
        }

        this._apiService.getPoints(filters).subscribe((response) => {
            this.points.set(response.data.map((point) => new PlayersMapHistory(point)));
        });
    }
}
