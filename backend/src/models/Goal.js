import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true },
        target: { type: String, required: true },
        unit: { type: String },
        current: { type: Number, default: 0 },
        max: { type: Number, default: 1 },
        icon: { type: String },
        tint: { type: String },
        color: { type: String },
        completed: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export default mongoose.model("Goal", GoalSchema);
