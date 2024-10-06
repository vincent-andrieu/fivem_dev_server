import mongoose from "mongoose";

import { Player } from "@shared/core";

const playersSchema = new mongoose.Schema<Player>(
    {
        position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            z: { type: Number, required: true },
            heading: { type: Number, required: true }
        }
    },
    {
        toObject: { virtuals: true },
        timestamps: true
    }
);

export default playersSchema;
