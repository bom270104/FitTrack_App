import mongoose from "mongoose";

const { Schema } = mongoose;

const healthLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  weight: {
    type: Number,
    required: [true, "Weight is required"],
    min: [1, "Weight must be greater than zero"],
  },
  bmi: {
    type: Number,
    required: [true, "BMI is required"],
  },
  tdee: {
    type: Number,
    required: [true, "TDEE is required"],
  },
  goalCalories: {
    type: Number,
    required: [true, "Goal calories is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HealthLog = mongoose.model("HealthLog", healthLogSchema);

export default HealthLog;
