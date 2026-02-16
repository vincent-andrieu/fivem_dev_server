import mongoose from "mongoose";

mongoose.set("strictQuery", false);

export async function initMongo(): Promise<void> {
    const uri = getMongoUri();

    try {
        console.log("Connecting to database...");
        await mongoose.connect(uri);
    } catch (error) {
        console.error(error);
        throw new Error("Database connection failed");
    }
    console.info("Mongo successfully connected :", uri);
}

function getMongoUri(): string {
    const MONGO_URI = process.env.MONGO_URI || GetConvar("MONGO_URI", "mongodb://localhost:27017/test");

    if (MONGO_URI) {
        return MONGO_URI;
    }
    throw new Error("Missing database configuration");
}
