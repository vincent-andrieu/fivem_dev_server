import { Component, computed, effect, signal } from "@angular/core";
import { MapComponent } from "./map/map.component";
import { Player, PlayersMapHistory } from "@shared/core";
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
export class AppComponent {
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

    constructor(
        private _apiService: ApiService,
        private _wsService: WebSocketService
    ) {
        effect(() => {
            const newPoint = this._wsService.lastPoint();
            if (newPoint && this._liveMode) {
                this.points.update((current) => [...current, newPoint]);
            }
        });

        this._loadPoints();
    }

    onVisiblePlayersChange(playerIds: Set<string>): void {
        this.visiblePlayers.set(playerIds);
    }

    onFiltersChange(filters: { from?: string; to?: string }): void {
        this._currentFilters = { ...this._currentFilters, ...filters };
        this._loadPoints();
    }

    onLiveModeChange(live: boolean): void {
        this._liveMode = live;
        if (live) {
            this._wsService.connect();
            this._apiService.getLivePoints().subscribe((livePoints) => {
                this.points.set(livePoints);
            });
        } else {
            this._wsService.disconnect();
            this._loadPoints();
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
            this.points.set(response.data);
        });
    }
}
