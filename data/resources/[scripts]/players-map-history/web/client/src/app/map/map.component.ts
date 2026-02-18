import { AfterViewInit, Component, OnDestroy, effect, input } from "@angular/core";
import { PlayersMapHistory } from "@shared/core";
import * as L from "leaflet";
import "leaflet.markercluster";
import { PlayerColorService } from "../shared/services/player-color.service";
import { MAP_OPTIONS, TILE_LAYER_OPTIONS, getStateIcon, gtaToLeaflet } from "./map.helpers";

@Component({
    selector: "app-map",
    standalone: true,
    templateUrl: "./map.component.html"
})
export class MapComponent implements AfterViewInit, OnDestroy {
    points = input<PlayersMapHistory[]>([]);
    visiblePlayers = input<Set<string>>(new Set());

    private _map!: L.Map;
    private _markerCluster!: L.MarkerClusterGroup;
    private _polylines = new Map<string, L.Polyline>();
    private _markers: L.CircleMarker[] = [];

    constructor(private _colorService: PlayerColorService) {
        effect(() => {
            const pointsHistory = this.points();
            const visible = this.visiblePlayers();

            if (this._map) {
                this._renderPoints(pointsHistory, visible);
            }
        });
    }

    ngAfterViewInit(): void {
        this._map = L.map("map", MAP_OPTIONS);

        L.tileLayer("assets/tiles/atlas/{z}/{x}/{y}.jpg", TILE_LAYER_OPTIONS).addTo(this._map);

        this._markerCluster = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            disableClusteringAtZoom: 5
        });
        this._map.addLayer(this._markerCluster);
    }

    ngOnDestroy(): void {
        this._map?.remove();
    }

    private _renderPoints(points: PlayersMapHistory[], visiblePlayers: Set<string>): void {
        this._markerCluster.clearLayers();
        this._markers = [];
        this._polylines.forEach((line) => this._map.removeLayer(line));
        this._polylines.clear();

        const pointsByPlayer = new Map<string, PlayersMapHistory[]>();

        for (const point of points) {
            const playerId = typeof point.player === "string" ? point.player : (point.player._id ?? "");
            if (!visiblePlayers.has(playerId)) {
                continue;
            }

            if (!pointsByPlayer.has(playerId)) {
                pointsByPlayer.set(playerId, []);
            }
            pointsByPlayer.get(playerId)?.push(point);
        }

        pointsByPlayer.forEach((playerPoints, playerId) => {
            const color = this._colorService.getColor(playerId);
            const sortedPoints = playerPoints.sort((ptA, ptB) => (ptA.createdAt?.getTime() ?? 0) - (ptB.createdAt?.getTime() ?? 0));

            const latLngs: L.LatLngExpression[] = [];

            for (const point of sortedPoints) {
                const [lat, lng] = gtaToLeaflet(point.coords.x, point.coords.y);
                latLngs.push([lat, lng]);

                const marker = L.circleMarker([lat, lng], {
                    radius: 6,
                    fillColor: color,
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.85
                });

                const icon = getStateIcon(point.playerState, point.isAiming);
                const date = new Date(point.createdAt ?? 0).toLocaleString();
                let popupContent = `
                    <div style="font-size: 13px; min-width: 180px;">
                        <b><span class="material-icons" style="font-size:16px;vertical-align:middle;">${icon}</span> ${point.playerState}</b><br/>
                        <b>Coords:</b> ${point.coords.x.toFixed(1)}, ${point.coords.y.toFixed(1)}, ${point.coords.z.toFixed(1)}<br/>
                        <b>Heading:</b> ${point.coords.heading.toFixed(1)}<br/>
                        <b>Session:</b> ${point.sessionId}<br/>
                        <b>Date:</b> ${date}
                `;

                if (point.vehicle) {
                    const seatLabel = point.vehicle.seat === -1 ? "Driver" : `Passenger ${point.vehicle.seat}`;
                    popupContent += `<br/><b>Vehicle:</b> ${point.vehicle.model} [${point.vehicle.plate}] (${seatLabel})`;
                }
                if (point.weapon) {
                    popupContent += `<br/><b>Weapon:</b> ${point.weapon}`;
                }
                if (point.isAiming) {
                    popupContent += `<br/><b>Aiming:</b> Yes`;
                }

                popupContent += `</div>`;
                marker.bindPopup(popupContent);

                this._markerCluster.addLayer(marker);
                this._markers.push(marker);
            }

            if (latLngs.length > 1) {
                const polyline = L.polyline(latLngs, {
                    color,
                    weight: 2,
                    opacity: 0.7
                }).addTo(this._map);
                this._polylines.set(playerId, polyline);
            }
        });
    }
}
