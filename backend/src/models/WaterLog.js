import mongoose from "mongoose";

const { Schema } = mongoose;

const waterLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [1, "Amount must be greater than zero"],
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

const WaterLog = mongoose.model("WaterLog", waterLogSchema);

export default WaterLog;
