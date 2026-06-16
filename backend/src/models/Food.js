import mongoose from "mongoose";

const { Schema } = mongoose;

const foodSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Food name is required"],
            trim: true,
        },
        calories: {
            type: Number,
            required: [true, "Calories are required"],
            min: [0, "Calories must be greater than or equal to 0"],
        },
        protein: {
            type: Number,
            required: [true, "Protein is required"],
            min: [0, "Protein must be greater than or equal to 0"],
        },
        carbs: {
            type: Number,
            required: [true, "Carbs are required"],
            min: [0, "Carbs must be greater than or equal to 0"],
        },
        fat: {
            type: Number,
            required: [true, "Fat is required"],
            min: [0, "Fat must be greater than or equal to 0"],
        },
        servingSize: {
            type: Number,
            required: [true, "Serving size is required"],
            min: [1, "Serving size must be at least 1 gram"],
        },
        category: {
            type: String,
            trim: true,
            default: "general",
        },
    },
    {
        timestamps: true,
    },
);

const Food = mongoose.model("Food", foodSchema);

export default Food;
