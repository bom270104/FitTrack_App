export const ACTIVITY_LEVELS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const BMI_CLASSIFICATIONS = [
  { min: 0, max: 16, label: "Suy nhược nghiêm trọng" },
  { min: 16, max: 17, label: "Độ gầy vừa phải" },
  { min: 17, max: 18.5, label: "Mỏng nhẹ" },
  { min: 18.5, max: 25, label: "Bình thường" },
  { min: 25, max: 30, label: "Thừa cân" },
  { min: 30, max: 35, label: "Béo phì độ I" },
  { min: 35, max: 40, label: "Béo phì độ II" },
  { min: 40, max: Infinity, label: "Béo phì độ III" },
];

export const GOAL_CALORIE_ADJUSTMENTS = {
  gain: 300,
  lose: -300,
  maintain: 0,
};

export const GENDER_OPTIONS = ["male", "female", "other"];

export const DEFAULT_DAILY_WATER_GOAL = 2000;
