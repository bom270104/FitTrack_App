/**
 * Core Onboarding Calculator
 * Calculates BMR, TDEE, and Macronutrient goals
 */

class OnboardingCalculator {
    static calculateBMR(weight, height, age, gender) {
        /**
         * Mifflin-St Jeor Formula
         * @param {number} weight - in kg
         * @param {number} height - in cm
         * @param {number} age - in years
         * @param {string} gender - 'male' or 'female'
         * @returns {number} BMR in kcal
         */
        if (gender === "male") {
            return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
        } else if (gender === "female") {
            return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
        }
        throw new Error("Invalid gender");
    }

    static calculateTDEE(bmr, activityLevel) {
        /**
         * @param {number} bmr - Basal Metabolic Rate
         * @param {number} activityLevel - PAL value (1.2, 1.375, 1.55, 1.725)
         * @returns {number} TDEE in kcal
         */
        return Math.round(bmr * activityLevel);
    }

    static calculateCalorieGoal(tdee, bmr, goal, deficit = 0) {
        /**
         * @param {number} tdee - Total Daily Energy Expenditure
         * @param {number} bmr - Basal Metabolic Rate (safety floor)
         * @param {string} goal - 'loss', 'maintain', or 'gain'
         * @param {number} deficit - deficit/surplus in kcal (250, 500, 1000)
         * @returns {number} Daily calorie goal
         */
        let calorieGoal = tdee;

        if (goal === "loss") {
            calorieGoal = tdee - deficit;
            // Safety: ensure goal is at least 80% of BMR or 1200 kcal min
            const minGoal = Math.max(Math.round(bmr * 0.8), 1200);
            calorieGoal = Math.max(calorieGoal, minGoal);
        } else if (goal === "maintain") {
            calorieGoal = tdee;
        } else if (goal === "gain") {
            calorieGoal = tdee + deficit;
        }

        return calorieGoal;
    }

    static distributeMacros(calorieGoal, goal) {
        /**
         * Distribute macronutrients based on goal
         * @param {number} calorieGoal - Total daily calorie goal
         * @param {string} goal - 'loss', 'maintain', or 'gain'
         * @returns {object} {proteinG, carbsG, fatG}
         */
        let proteinRatio, carbsRatio, fatRatio;

        if (goal === "loss") {
            // High protein to preserve muscle during deficit
            proteinRatio = 0.4;
            carbsRatio = 0.4;
            fatRatio = 0.2;
        } else if (goal === "maintain") {
            // Balanced macro split
            proteinRatio = 0.3;
            carbsRatio = 0.45;
            fatRatio = 0.25;
        } else if (goal === "gain") {
            // Moderate protein for muscle gain
            proteinRatio = 0.3;
            carbsRatio = 0.4;
            fatRatio = 0.3;
        }

        // Calculate calories per macro
        const proteinKcal = calorieGoal * proteinRatio;
        const carbsKcal = calorieGoal * carbsRatio;
        const fatKcal = calorieGoal * fatRatio;

        // Convert to grams
        const proteinG = Math.round(proteinKcal / 4);
        const carbsG = Math.round(carbsKcal / 4);
        const fatG = Math.round(fatKcal / 9);

        return { proteinG, carbsG, fatG };
    }

    static completeOnboarding(payload) {
        /**
         * Main orchestration function
         * @param {object} payload - {gender, age, height_cm, weight_kg, target_weight_kg, activity_level, goal, deficit_or_surplus}
         * @returns {object} Complete profile with all calculations
         */
        const { gender, age, height_cm, weight_kg, target_weight_kg, activity_level, goal, deficit_or_surplus } = payload;

        // Validate inputs
        if (!["male", "female"].includes(gender)) throw new Error("Invalid gender");
        if (age < 13 || age > 100) throw new Error("Invalid age");
        if (height_cm < 140 || height_cm > 220) throw new Error("Invalid height");
        if (weight_kg < 30 || weight_kg > 200) throw new Error("Invalid weight");
        if (![1.2, 1.375, 1.55, 1.725].includes(activity_level)) throw new Error("Invalid activity level");
        if (!["loss", "maintain", "gain"].includes(goal)) throw new Error("Invalid goal");

        // Calculate
        const bmr = this.calculateBMR(weight_kg, height_cm, age, gender);
        const tdee = this.calculateTDEE(bmr, activity_level);
        const calorieGoal = this.calculateCalorieGoal(tdee, bmr, goal, deficit_or_surplus);
        const { proteinG, carbsG, fatG } = this.distributeMacros(calorieGoal, goal);
        const bmi = Math.round((weight_kg / Math.pow(height_cm / 100, 2)) * 10) / 10;

        // Use target_weight from user input if provided, otherwise default to current weight
        const targetWeight = target_weight_kg || weight_kg;

        return {
            bmi,
            bmr,
            tdee,
            calorieGoal,
            proteinG,
            carbsG,
            fatG,
            targetWeight,
            calorieDeficitSurplus: goal === "loss" ? -deficit_or_surplus : goal === "gain" ? deficit_or_surplus : 0,
        };
    }
}

export default OnboardingCalculator;
