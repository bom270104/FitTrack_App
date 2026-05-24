import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import {
  ACTIVITY_LEVELS,
  DEFAULT_DAILY_WATER_GOAL,
  GENDER_OPTIONS,
  GOAL_CALORIE_ADJUSTMENTS,
} from "../constants/index.js";

const { Schema } = mongoose;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be greater than zero"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: GENDER_OPTIONS,
    },
    height: {
      type: Number,
      required: [true, "Height is required"],
      min: [1, "Height must be greater than zero"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [1, "Weight must be greater than zero"],
    },
    activityLevel: {
      type: String,
      required: [true, "Activity level is required"],
      enum: Object.keys(ACTIVITY_LEVELS),
    },
    goal: {
      type: String,
      required: [true, "Goal is required"],
      enum: Object.keys(GOAL_CALORIE_ADJUSTMENTS),
    },
    dailyWaterGoal: {
      type: Number,
      default: DEFAULT_DAILY_WATER_GOAL,
      min: [0, "Daily water goal must be zero or greater"],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
