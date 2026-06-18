import mongoose from "mongoose";

const { Schema } = mongoose;

const bmiHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    bmi: {
        type: Number,
        required: [true, "BMI is required"],
    },
    status: {
        type: String,
        required: [true, "BMI status is required"],
    },
    weight: {
        type: Number,
        required: [true, "Weight is required"],
        min: [1, "Weight must be greater than zero"],
    },
    height: {
        type: Number,
        required: [true, "Height is required"],
        min: [1, "Height must be greater than zero"],
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

const BmiHistory = mongoose.model("BmiHistory", bmiHistorySchema);

export default BmiHistory;