'use strict';

var perf_hooks = require('perf_hooks');
var mongoose = require('mongoose');

// @ts-expect-error perf_hooks is the default node performance module
global.performance = perf_hooks.performance;

/* eslint-disable @typescript-eslint/naming-convention */
const env = {
    MONGO_URI: undefined,
    MONGO_HOST: "localhost",
    MONGO_PORT: "27017",
    MONGO_DB_NAME: "test",
    MONGO_USERNAME: undefined,
    MONGO_PASSWORD: undefined
};
mongoose.set("strictQuery", false);
async function initMongo() {
    const url = getMongoUrl();
    try {
        console.log("Connecting to database...");
        await mongoose.connect(url);
    }
    catch {
        throw new Error("Database connection failed");
    }
    console.info("Mongo successfully connected : \n\t- Address : " +
        env.MONGO_HOST +
        "\n\t- Port : " +
        env.MONGO_PORT +
        "\n\t- Name : " +
        env.MONGO_DB_NAME);
}
function getMongoUrl() {
    const baseUri = `${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB_NAME}`;
    const uri = `mongodb://${baseUri}`;
    return uri;
}

async function main() {
    await initMongo();
}
try {
    main().catch(console.error);
}
catch (error) {
    console.error(error);
}
