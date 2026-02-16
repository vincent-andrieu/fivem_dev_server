import { PlayersMapHistoryModel } from "@shared/server";
import { WebSocket, WebSocketServer } from "ws";

export function startChangeStreamWatcher(wss: WebSocketServer): void {
    const playersMapHistoryModel = new PlayersMapHistoryModel();
    const changeStream = playersMapHistoryModel.watch([], { fullDocument: "updateLookup" });

    changeStream.on("change", (change) => {
        if (change.operationType === "insert") {
            const point = change.fullDocument;
            const message = JSON.stringify({ type: "new_point", data: point });

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    changeStream.on("error", (error: Error) => {
        console.error("Change stream error:", error);
    });

    console.log("Change stream watcher started on players_map_history");
}
