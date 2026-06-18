import mongoose from "mongoose";
import User from "./src/models/User.js";
import UserProfile from "./src/models/UserProfile.js";

const DATABASE_URL = "mongodb://127.0.0.1:27017/fittrack";

async function run() {
    await mongoose.connect(DATABASE_URL);
    const userId = "6a2fffd6b0a11ec3fafdd193";
    const user = await User.findById(userId).lean();
    const profile = await UserProfile.findOne({ user_id: userId }).lean();
    console.log("USER:", JSON.stringify(user, null, 2));
    console.log("PROFILE:", JSON.stringify(profile, null, 2));
    await mongoose.disconnect();
}

run().catch(console.error);
