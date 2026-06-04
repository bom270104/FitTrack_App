import NotificationSetting from "../models/NotificationSetting.js";

export async function getNotificationSettingByUser(userId) {
    return NotificationSetting.findOne({ userId }).lean();
}

export async function upsertNotificationSetting(userId, payload) {
    const data = Object.assign({}, payload, { userId });
    return NotificationSetting.findOneAndUpdate({ userId }, data, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
}

export async function removeNotificationSetting(userId) {
    return NotificationSetting.findOneAndRemove({ userId });
}

export async function markLastSent(userId, date) {
    return NotificationSetting.findOneAndUpdate({ userId }, { lastSent: date }, { new: true }).lean();
}

export default { getNotificationSettingByUser, upsertNotificationSetting, removeNotificationSetting };
