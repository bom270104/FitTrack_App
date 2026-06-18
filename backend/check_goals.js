import mongoose from "mongoose";

const DATABASE_URL = "mongodb://127.0.0.1:27017/fittrack";

async function run() {
    await mongoose.connect(DATABASE_URL);
    const userId = "6a2fffd6b0a11ec3fafdd193";
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("COLLECTIONS:", collections.map(c => c.name));

    // Find in Goals collection if exists
    const goalsCol = db.collection("goals");
    if (goalsCol) {
        const goals = await goalsCol.find({ userId: new mongoose.Types.ObjectId(userId) }).toArray();
        console.log("USER GOALS:", JSON.stringify(goals, null, 2));
    }

    await mongoose.disconnect();
}

run().catch(console.error);
