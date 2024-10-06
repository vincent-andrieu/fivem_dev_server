import mongoose from "mongoose";

const MONGO_URI = GetConvar("MONGO_URI", "mongodb://localhost:27017/test");

mongoose.set("strictQuery", false);

export async function initMongo(): Promise<void> {
    const url = getMongoUrl();

    try {
        console.log("Connecting to database...");
        await mongoose.connect(url);
    } catch (error) {
        console.error(error);
        throw new Error("Database connection failed");
    }
    console.info(
        "Mongo successfully connected : \n\t- Address : " + mongoose.connection.host + "\n\t- Port : " + mongoose.connection.port + "\n\t- Name : " + mongoose.connection.name
    );
}

function getMongoUrl(): string {
    if (MONGO_URI) {
        return MONGO_URI;
    }
    throw new Error("Missing database configuration");
}
