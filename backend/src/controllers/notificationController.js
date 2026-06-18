// @ts-nocheck
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
    getNotificationSettingByUser,
    upsertNotificationSetting,
    removeNotificationSetting,
} from "../services/notificationService.js";
import { sendMail, isMailerConfigured } from "../services/mailerService.js";

export const getSetting = asyncHandler(async (req, res) => {
    const setting = await getNotificationSettingByUser(req.user._id);
    return sendSuccess(res, { message: "Notification setting retrieved", data: { setting } });
});

export const upsertSetting = asyncHandler(async (req, res) => {
    const payload = req.body;
    const setting = await upsertNotificationSetting(req.user._id, payload);
    return sendSuccess(res, { message: "Notification setting saved", data: { setting } });
});

export const deleteSetting = asyncHandler(async (req, res) => {
    await removeNotificationSetting(req.user._id);
    return sendSuccess(res, { message: "Notification setting removed" });
});

export const sendTestEmail = asyncHandler(async (req, res) => {
    if (!isMailerConfigured()) {
        return sendError(res, {
            statusCode: 503,
            message: "SMTP is not configured",
            data: { sent: false },
        });
    }

    const userEmail = req.user?.email;
    const userName = req.user?.fullName || "user";

    await sendMail({
        to: userEmail,
        subject: "FitTrack SMTP test email",
        text:
            `Hi ${userName},\n\n` +
            "This is a test email from FitTrack SMTP settings. If you received this message, your Gmail SMTP configuration is working.\n\n" +
            "— FitTrack",
    });

    return sendSuccess(res, {
        message: "Test email sent successfully",
        data: { sent: true, to: userEmail },
    });
});

export default { getSetting, upsertSetting, deleteSetting, sendTestEmail };
