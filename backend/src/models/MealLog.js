import mongoose from "mongoose";

const { Schema } = mongoose;

const mealFoodSchema = new Schema(
    {
        foodId: {
            type: Schema.Types.ObjectId,
            ref: "Food",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        weightGrams: {
            type: Number,
            required: true,
            min: [1, "Weight must be greater than 0"],
        },
        totalCalories: {
            type: Number,
            required: true,
            min: [0, "Total calories must be greater than or equal to 0"],
        },
        protein: {
            type: Number,
            required: true,
            min: [0, "Protein must be greater than or equal to 0"],
        },
        carbs: {
            type: Number,
            required: true,
            min: [0, "Carbs must be greater than or equal to 0"],
        },
        fat: {
            type: Number,
            required: true,
            min: [0, "Fat must be greater than or equal to 0"],
        },
    },
    { _id: true },
);

const mealLogSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: String,
            required: true,
            index: true,
        },
        mealType: {
            type: String,
            required: true,
            enum: ["breakfast", "lunch", "dinner", "snack"],
        },
        foods: {
            type: [mealFoodSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

mealLogSchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

const MealLog = mongoose.model("MealLog", mealLogSchema);

export default MealLog;
