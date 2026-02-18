import { CommonModule } from "@angular/common";
import { Component, computed, effect, input, output, signal, untracked } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSliderModule } from "@angular/material/slider";
import { Player } from "@shared/core";
import { DEFAULT_FROM_FILTER_HOURS } from "../app.component";
import { PlayerColorService } from "../shared/services/player-color.service";

@Component({
    selector: "app-sidebar",
    standalone: true,
    imports: [CommonModule, FormsModule, MatCheckboxModule, MatSliderModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
    templateUrl: "./sidebar.component.html"
})
export class SidebarComponent {
    players = input<Player[]>([]);
    selectedPlayerIds = signal<Set<string>>(new Set());
    searchQuery = "";
    timeRangeStart = 0;
    timeRangeEnd = DEFAULT_FROM_FILTER_HOURS;
    liveModeSignal = signal(false);
    liveMode = this.liveModeSignal.asReadonly();
    visiblePlayersChange = output<Set<string>>();
    filtersChange = output<{ from?: string; to?: string }>();
    liveModeChange = output<boolean>();
    filteredPlayers = computed(() => {
        const query = this.searchQuery.toLowerCase();

        if (!query) {
            return this.players();
        }
        return this.players().filter((player) => {
            return player.name?.toLowerCase().includes(query) || player._id?.includes(query);
        });
    });

    constructor(private _colorService: PlayerColorService) {
        effect(() => {
            const playersList = this.players();

            untracked(() => {
                if (this.selectedPlayerIds().size === 0 && playersList.length > 0) {
                    const allIds = new Set(playersList.map((player) => player._id).filter((id): id is string => !!id));
                    this.selectedPlayerIds.set(allIds);
                    this.visiblePlayersChange.emit(allIds);
                }
            });
        });
    }

    getPlayerColor(playerId: string): string {
        return this._colorService.getColor(playerId);
    }

    isPlayerVisible(playerId: string): boolean {
        return this.selectedPlayerIds().has(playerId);
    }

    togglePlayer(playerId: string): void {
        const current = new Set(this.selectedPlayerIds());
        if (current.has(playerId)) {
            current.delete(playerId);
        } else {
            current.add(playerId);
        }
        this.selectedPlayerIds.set(current);
        this.visiblePlayersChange.emit(current);
    }

    selectAll(): void {
        const allIds = new Set(
            this.players()
                .map((player) => player._id)
                .filter((id): id is string => !!id)
        );
        this.selectedPlayerIds.set(allIds);
        this.visiblePlayersChange.emit(allIds);
    }

    selectNone(): void {
        this.selectedPlayerIds.set(new Set());
        this.visiblePlayersChange.emit(new Set());
    }

    toggleLive(): void {
        const newMode = !this.liveModeSignal();
        this.liveModeSignal.set(newMode);
        this.liveModeChange.emit(newMode);
    }

    onTimeRangeChange(): void {
        if (this.liveMode()) {
            return;
        }
        const now = Date.now();
        const from = new Date(now - this.timeRangeEnd * 60 * 60 * 1000).toISOString();
        const to = this.timeRangeStart === 0 ? undefined : new Date(now - this.timeRangeStart * 60 * 60 * 1000).toISOString();

        this.filtersChange.emit({ from, to });
    }
}
