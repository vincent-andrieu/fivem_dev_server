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
    private _markers: L.Marker[] = [];
    private _hitLayer!: L.LayerGroup;

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
            disableClusteringAtZoom: 5,
            iconCreateFunction: (cluster) => {
                const childMarkers = cluster.getAllChildMarkers();
                const colors = new Set<string>();
                for (const child of childMarkers) {
                    const playerColor = (child as any).playerColor;
                    if (playerColor) {
                        colors.add(playerColor);
                    }
                }
                const color = [...colors][0] ?? "#3388ff";
                const count = childMarkers.length;
                const size = count < 10 ? 30 : count < 50 ? 36 : 42;

                return L.divIcon({
                    html: `<div style="
                        background-color: ${color};
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        border: 2px solid #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #fff;
                        font-weight: bold;
                        font-size: 12px;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
                    ">${count}</div>`,
                    className: "",
                    iconSize: L.point(size, size)
                });
            }
        });
        this._map.addLayer(this._markerCluster);

        this._hitLayer = L.layerGroup().addTo(this._map);
    }

    ngOnDestroy(): void {
        this._map?.remove();
    }

    private _renderPoints(points: PlayersMapHistory[], visiblePlayers: Set<string>): void {
        this._markerCluster.clearLayers();
        this._hitLayer.clearLayers();
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

                const icon = getStateIcon(point.playerState, point.isAiming);
                const pointSize = 20;
                const marker = L.marker([lat, lng], {
                    interactive: false,
                    icon: L.divIcon({
                        html: `<div style="
                            background-color: ${color};
                            width: ${pointSize}px;
                            height: ${pointSize}px;
                            border-radius: 50%;
                            border: 1.5px solid #fff;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                        "><span class="material-icons" style="font-size: 12px; color: #fff;">${icon}</span></div>`,
                        className: "",
                        iconSize: L.point(pointSize, pointSize),
                        iconAnchor: L.point(pointSize / 2, pointSize / 2)
                    })
                });

                (marker as any).playerColor = color;

                const hitMarker = L.circleMarker([lat, lng], {
                    radius: 12,
                    fillOpacity: 0,
                    opacity: 0,
                    weight: 0
                });
                (hitMarker as any).playerColor = color;

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
                hitMarker.bindTooltip(popupContent);

                this._markerCluster.addLayer(marker);
                this._hitLayer.addLayer(hitMarker);
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
