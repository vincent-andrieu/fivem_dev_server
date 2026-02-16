import { Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { PlayersMapHistory } from "@shared/core";

@Injectable({ providedIn: "root" })
export class WebSocketService {
    readonly connected = signal(false);
    readonly lastPoint = signal<PlayersMapHistory | undefined>(undefined);

    private _ws?: WebSocket;
    private _reconnectTimer?: ReturnType<typeof setTimeout>;

    connect(): void {
        if (this._ws) {
            return;
        }

        this._ws = new WebSocket(environment.wsUrl);

        this._ws.onopen = () => {
            this.connected.set(true);
            console.log("WebSocket connected");
        };

        this._ws.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);

            if (message.type === "new_point") {
                this.lastPoint.set(message.data);
            }
        };

        this._ws.onclose = () => {
            this.connected.set(false);
            this._ws = undefined;
            this._scheduleReconnect();
        };

        this._ws.onerror = () => {
            this._ws?.close();
        };
    }

    disconnect(): void {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = undefined;
        }
        this._ws?.close();
        this._ws = undefined;
        this.connected.set(false);
    }

    private _scheduleReconnect(): void {
        this._reconnectTimer = setTimeout(() => {
            if (this._reconnectTimer) {
                this._reconnectTimer = undefined;
                this.connect();
            }
        }, 3000);
    }
}
