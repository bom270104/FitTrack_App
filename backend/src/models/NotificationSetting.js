import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSettingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  intervalHours: {
    type: Number,
    default: 3,
    min: 1,
  },
  startTime: {
    type: String,
    default: "08:00",
  },
  endTime: {
    type: String,
    default: "22:00",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NotificationSetting = mongoose.model(
  "NotificationSetting",
  notificationSettingSchema,
);

export default NotificationSetting;
