import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";

async function run() {
    try {
        await connectDB();

        const cursor = Goal.find(
            {
                $or: [
                    { unit: "ml" },
                    { title: { $regex: "nước|nuoc|ml", $options: "i" } },
                    { target: { $regex: "ml", $options: "i" } },
                ],
                $or: [{ max: { $exists: false } }, { max: { $lte: 1 } }],
            }
        ).cursor();

        let updated = 0;
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            try {
                const g = doc;
                const rawTarget = String(g.max ?? g.target ?? "");
                const parsed = Number(rawTarget.replace(/[^0-9.]/g, ""));
                let newMax = Number.isFinite(parsed) && parsed > 0 ? parsed : null;

                if (!newMax) {
                    const user = await User.findById(g.user_id).lean();
                    if (user && typeof user.dailyWaterGoal === "number" && user.dailyWaterGoal > 0) {
                        newMax = user.dailyWaterGoal;
                    }
                }

                if (!newMax) newMax = 2000;

                if (newMax && newMax !== g.max) {
                    await Goal.updateOne({ _id: g._id }, { $set: { max: newMax, unit: "ml" } });
                    updated++;
                    console.log(`Updated goal ${g._id} -> max=${newMax}`);
                }
            } catch (err) {
                console.error("Error updating goal", doc._id, err);
            }
        }

        console.log(`Migration complete. Updated ${updated} goals.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
