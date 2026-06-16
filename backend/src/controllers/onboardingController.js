import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { validateOnboardingInput } from "../validations/onboarding.validation.js";
import OnboardingCalculator from "../utils/OnboardingCalculator.js";
import UserProfile from "../models/UserProfile.js";
import User from "../models/User.js";
import CaloriesLog from "../models/CaloriesLog.js";

export const completeOnboarding = asyncHandler(async (req, res) => {
    const { gender, age, height_cm, weight_kg, activity_level, goal, deficit_or_surplus } = req.body;

    // Validate inputs
    validateOnboardingInput({
        gender,
        age,
        height_cm,
        weight_kg,
        activity_level,
        goal,
        deficit_or_surplus: deficit_or_surplus || 0,
    });

    // Calculate profile
    const calculated = OnboardingCalculator.completeOnboarding({
        gender,
        age,
        height_cm,
        weight_kg,
        activity_level,
        goal,
        deficit_or_surplus: deficit_or_surplus || 0,
    });

    // Create user profile
    const profile = await UserProfile.findOneAndUpdate(
        { user_id: req.user._id },
        {
            user_id: req.user._id,
            gender,
            date_of_birth: new Date(new Date().getFullYear() - age, 0, 1),
            age,
            height_cm,
            weight_kg,
            bmi: calculated.bmi,
            bmr: calculated.bmr,
            tdee: calculated.tdee,
            activity_level,
            goal,
            calorie_deficit_surplus: calculated.calorieDeficitSurplus,
            calorie_goal: calculated.calorieGoal,
            protein_goal_g: calculated.proteinG,
            carbs_goal_g: calculated.carbsG,
            fat_goal_g: calculated.fatG,
            target_weight: calculated.targetWeight,
            onboarding_completed_at: new Date(),
        },
        {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        },
    );

    // Create initial CaloriesLog entry for dashboard stats
    await CaloriesLog.create({
        userId: req.user._id,
        tdee: calculated.tdee,
        goal,
        recommendedCalories: calculated.calorieGoal,
        bmr: calculated.bmr,
        activityLevel: activity_level,
        weight: weight_kg,
        height: height_cm,
        age,
        gender,
    });

    // Update user record with completed profile fields
    await User.updateOne(
        { _id: req.user._id },
        {
            profileComplete: true,
            age,
            gender,
            height: height_cm,
            weight: weight_kg,
            activityLevel: activity_level,
            goal,
            dailyWaterGoal: req.user.dailyWaterGoal || 2000,
        }
    );

    return sendSuccess(res, {
        statusCode: 201,
        message: "Onboarding completed successfully",
        data: {
            profile: {
                calorieGoal: calculated.calorieGoal,
                proteinG: calculated.proteinG,
                carbsG: calculated.carbsG,
                fatG: calculated.fatG,
                targetWeight: calculated.targetWeight,
            },
        },
    });
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const profile = await UserProfile.findOne({ user_id: req.user._id });

    if (!profile) {
        return sendSuccess(res, {
            message: "User profile not found",
            data: null,
        });
    }

    return sendSuccess(res, {
        message: "User profile retrieved successfully",
        data: {
            profile,
        },
    });
});
