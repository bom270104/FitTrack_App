import { connectDB } from "../config/db.js";
import Food from "../models/Food.js";
import { foodSeed } from "../data/foodSeed.js";

export const seedFoodCatalog = async () => {
    const existingCount = await Food.countDocuments();
    if (existingCount > 0) {
        console.log(`Food catalog already contains ${existingCount} item(s). Skipping seed.`);
        return false;
    }

    const inserted = await Food.insertMany(foodSeed);
    console.log(`Seeded food catalog with ${inserted.length} items.`);
    return true;
};

const runSeed = async () => {
    try {
        await connectDB();
        await seedFoodCatalog();
        process.exit(0);
    } catch (error) {
        console.error("Food seed failed:", error);
        process.exit(1);
    }
};

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith("/seedFoods.js")) {
    runSeed();
}
