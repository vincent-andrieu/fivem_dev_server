import mongoose from "mongoose";

import { PlayerState } from "@shared/core";

const playersMapHistorySchema = new mongoose.Schema(
    {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "players", required: true },
        sessionId: { type: Number, required: true },
        coords: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            z: { type: Number, required: true },
            heading: { type: Number, required: true }
        },
        vehicle: {
            type: {
                model: { type: String, required: true },
                plate: { type: String, required: true },
                seat: { type: Number }
            }
        },
        playerState: { type: String, required: true, enum: Object.values(PlayerState) },
        skin: {
            type: [
                {
                    componentId: { type: Number, required: true },
                    drawable: { type: Number, required: true },
                    texture: { type: Number, required: true }
                }
            ]
        },
        weapon: { type: String },
        isAiming: { type: Boolean }
    },
    {
        toObject: { virtuals: true },
        timestamps: true
    }
);

playersMapHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
playersMapHistorySchema.index({ player: 1, createdAt: 1 });
playersMapHistorySchema.index({ sessionId: 1 });

export default playersMapHistorySchema;
