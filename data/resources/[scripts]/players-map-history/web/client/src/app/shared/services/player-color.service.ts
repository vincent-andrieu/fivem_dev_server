import { Injectable } from "@angular/core";

const PALETTE = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#F1948A", "#82E0AA", "#F8C471", "#AED6F1", "#D7BDE2",
    "#A3E4D7", "#FAD7A0", "#A9CCE3", "#D5F5E3", "#FADBD8"
];

@Injectable({ providedIn: "root" })
export class PlayerColorService {
    private _colorMap = new Map<string, string>();
    private _colorIndex = 0;

    getColor(playerId: string): string {
        const existing = this._colorMap.get(playerId);
        if (existing) {
            return existing;
        }

        const color = PALETTE[this._colorIndex % PALETTE.length];
        this._colorIndex++;
        this._colorMap.set(playerId, color);
        return color;
    }
}
