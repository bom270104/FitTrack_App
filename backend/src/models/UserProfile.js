import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // Basic Measurements
        gender: {
            type: String,
            enum: ["male", "female"],
            required: true,
        },
        date_of_birth: {
            type: Date,
            required: true,
        },
        age: {
            type: Number,
            required: true,
            min: 13,
            max: 100,
        },
        height_cm: {
            type: Number,
            required: true,
            min: 140,
            max: 220,
        },
        weight_kg: {
            type: Number,
            required: true,
            min: 30,
            max: 200,
        },

        // Calculations
        bmi: {
            type: Number,
            required: true,
        },
        bmr: {
            type: Number,
            required: true,
        },
        tdee: {
            type: Number,
            required: true,
        },

        // Activity & Goal
        activity_level: {
            type: Number,
            enum: [1.2, 1.375, 1.55, 1.725],
            required: true,
            default: 1.55,
        },
        goal: {
            type: String,
            enum: ["loss", "maintain", "gain"],
            required: true,
            default: "maintain",
        },
        calorie_deficit_surplus: {
            type: Number,
            default: 0,
        },

        // Targets
        calorie_goal: {
            type: Number,
            required: true,
        },
        protein_goal_g: {
            type: Number,
            required: true,
        },
        carbs_goal_g: {
            type: Number,
            required: true,
        },
        fat_goal_g: {
            type: Number,
            required: true,
        },

        // Metadata
        target_weight: {
            type: Number,
        },
        onboarding_completed_at: {
            type: Date,
        },
    },
    { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

export default UserProfile;
