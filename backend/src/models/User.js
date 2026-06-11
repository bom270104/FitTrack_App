import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { DEFAULT_DAILY_WATER_GOAL, GENDER_OPTIONS } from "../constants/index.js";

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
      min: [1, "Age must be greater than 0"],
    },

    gender: {
      type: String,
      enum: GENDER_OPTIONS,
      lowercase: true,
      trim: true,
    },

    height: {
      type: Number,
      min: [1, "Height must be greater than 0"],
    },

    weight: {
      type: Number,
      min: [1, "Weight must be greater than 0"],
    },

    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      lowercase: true,
      trim: true,
    },

    goal: {
      type: String,
      enum: ["gain", "lose", "maintain"],
      lowercase: true,
      trim: true,
    },

    dailyWaterGoal: {
      type: Number,
      min: [1, "Daily water goal must be greater than 0"],
      default: DEFAULT_DAILY_WATER_GOAL,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
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
