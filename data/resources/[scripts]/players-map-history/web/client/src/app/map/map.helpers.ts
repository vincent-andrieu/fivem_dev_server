import { PlayerState } from "@shared/core";
import * as L from "leaflet";

export const CUSTOM_CRS = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,
    transformation: new L.Transformation(0.02072, 117.3, -0.0205, 172.8),

    distance: function (latlng1: L.LatLng, latlng2: L.LatLng): number {
        const dx = latlng2.lng - latlng1.lng;
        const dy = latlng2.lat - latlng1.lat;
        return Math.sqrt(dx * dx + dy * dy);
    },

    zoom: function (scale: number): number {
        return Math.log(scale) / Math.LN2;
    },

    scale: function (zoom: number): number {
        return Math.pow(2, zoom);
    }
}) as L.CRS;

export const TILE_LAYER_OPTIONS: L.TileLayerOptions = {
    minZoom: 0,
    maxZoom: 5,
    noWrap: true,
    bounds: L.latLngBounds([
        [-5000, -6000],
        [9000, 7000]
    ])
};

export const MAP_OPTIONS: L.MapOptions = {
    crs: CUSTOM_CRS,
    minZoom: 0,
    maxZoom: 5,
    zoom: 3,
    center: [0, 0] as L.LatLngExpression,
    preferCanvas: true,
    attributionControl: false,
    maxBounds: L.latLngBounds([
        [-40000, -40000],
        [40000, 40000]
    ]),
    maxBoundsViscosity: 0.1
};

export function gtaToLeaflet(gtaX: number, gtaY: number): [number, number] {
    return [gtaY, gtaX];
}

export function leafletToGta(lat: number, lng: number): { x: number; y: number } {
    return { x: lng, y: lat };
}

export function getStateIcon(playerState: PlayerState, isAiming?: boolean): string {
    if (isAiming) {
        return "gps_fixed";
    }
    switch (playerState) {
        case PlayerState.IN_VEHICLE:
            return "directions_car";
        case PlayerState.DEAD:
            return "dangerous";
        case PlayerState.SWIMMING:
        case PlayerState.DIVING:
            return "pool";
        case PlayerState.PARACHUTING:
            return "paragliding";
        case PlayerState.FALLING:
            return "trending_down";
        case PlayerState.CLIMBING:
            return "trending_up";
        case PlayerState.RAGDOLL:
            return "accessibility_new";
        default:
            return "directions_walk";
    }
}
