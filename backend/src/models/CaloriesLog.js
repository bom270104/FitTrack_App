import mongoose from "mongoose";

const { Schema } = mongoose;

const caloriesLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    tdee: {
        type: Number,
        required: [true, "TDEE is required"],
    },
    goal: {
        type: String,
        required: [true, "Goal is required"],
    },
    recommendedCalories: {
        type: Number,
        required: [true, "Recommended calories is required"],
    },
    bmr: {
        type: Number,
        required: [true, "BMR is required"],
    },
    activityLevel: {
        type: String,
        required: [true, "Activity level is required"],
    },
    weight: {
        type: Number,
        required: [true, "Weight is required"],
        min: [1, "Weight must be greater than zero"],
    },
    height: {
        type: Number,
        required: [true, "Height is required"],
        min: [1, "Height must be greater than zero"],
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [1, "Age must be greater than zero"],
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const CaloriesLog = mongoose.model("CaloriesLog", caloriesLogSchema);

export default CaloriesLog;