import { AppError } from "../utils/errors.js";

export const validateOnboardingInput = (payload) => {
    const errors = [];

    // Gender validation
    if (!["male", "female"].includes(payload.gender)) {
        errors.push("Giới tính không hợp lệ");
    }

    // Age validation
    if (!Number.isInteger(payload.age) || payload.age < 13 || payload.age > 100) {
        errors.push("Tuổi phải từ 13 đến 100");
    }

    // Height validation
    if (payload.height_cm < 140 || payload.height_cm > 220) {
        errors.push("Chiều cao phải từ 140 đến 220 cm");
    }

    // Weight validation
    if (payload.weight_kg < 30 || payload.weight_kg > 200) {
        errors.push("Cân nặng phải từ 30 đến 200 kg");
    }

    // Target weight validation
    if (payload.target_weight_kg && (payload.target_weight_kg < 30 || payload.target_weight_kg > 200)) {
        errors.push("Cân nặng mục tiêu phải từ 30 đến 200 kg");
    }

    // Activity level validation
    if (![1.2, 1.375, 1.55, 1.725].includes(payload.activity_level)) {
        errors.push("Tần suất vận động không hợp lệ");
    }

    // Goal validation
    if (!["loss", "maintain", "gain"].includes(payload.goal)) {
        errors.push("Mục tiêu không hợp lệ");
    }

    // Deficit/Surplus validation for loss/gain goals
    if (["loss", "gain"].includes(payload.goal)) {
        if (![250, 500, 825, 1000].includes(payload.deficit_or_surplus)) {
            errors.push("Mức thay đổi phải là 250, 500, 825 hoặc 1000 kcal");
        }
    }

    if (errors.length > 0) {
        throw new AppError(errors.join("; "), 400);
    }
};
