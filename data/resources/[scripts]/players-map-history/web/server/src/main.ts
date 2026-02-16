import { initMongo } from "@shared/server";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import { initExpress } from "./init/express";
import { startChangeStreamWatcher } from "./websocket/changeStreamWatcher";

dotenv.config();

async function main() {
    await initMongo();

    const app = initExpress();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");
        ws.on("close", () => console.log("WebSocket client disconnected"));
    });

    startChangeStreamWatcher(wss);

    const port = parseInt(process.env.PORT || "3000", 10);
    server.listen(port, () => {
        console.log(`Web Server running on port ${port}`);
    });
}

main().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
