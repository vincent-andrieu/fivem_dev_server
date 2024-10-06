import mongoose from "mongoose";

import { Player } from "@shared/core";

const playersSchema = new mongoose.Schema<Player>(
    {
        position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            z: { type: Number, required: true },
            heading: { type: Number, required: true }
        },
        identifiers: {
            license: { type: String, required: true, unique: true },
            discord: { type: String, required: true, unique: true },
            fivem: { type: String, unique: true },
            license2: { type: String, required: true, unique: true },
            ip: { type: String, required: true, unique: true }
        }
    },
    {
        toObject: { virtuals: true },
        timestamps: true
    }
);

export default playersSchema;
