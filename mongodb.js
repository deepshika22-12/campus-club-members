
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");

let mongoServer;
let client;

async function connectDB() {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();

    const db = client.db("campus_clubs");
    return db.collection("members");
}

async function closeDB() {
    if (client) {
        await client.close();
        client = null;
    }

    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
}

module.exports = { connectDB, closeDB };