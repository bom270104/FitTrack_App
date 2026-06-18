import cron from "node-cron";
import NotificationSetting from "../models/NotificationSetting.js";
import User from "../models/User.js";
import { sendMail } from "../services/mailerService.js";
import { markLastSent } from "../services/notificationService.js";

/**
 * Simple scheduler that checks enabled NotificationSetting documents
 * and logs a reminder for demonstration purposes.
 */
export function startScheduler() {
    // run every minute
    cron.schedule("*/1 * * * *", async () => {
        try {
            const now = new Date();
            const settings = await NotificationSetting.find({ enabled: true }).lean();

            for (const s of settings) {
                const user = await User.findById(s.userId).lean();
                const who = user ? `${user.fullName} <${user.email}>` : `user:${s.userId}`;

                if (!user || !user.email) {
                    console.log(`[scheduler] Skipped reminder for ${who} (no email)`);
                    continue;
                }

                const lastSentAt = s.lastSent ? new Date(s.lastSent) : null;
                const intervalVal = Number(s.intervalHours || 3);
                const isMinute = s.intervalUnit === "minute";
                const intervalMs = isMinute ? intervalVal * 60 * 1000 : intervalVal * 60 * 60 * 1000;
                const shouldSend = !lastSentAt || (now.getTime() - lastSentAt.getTime()) >= intervalMs;

                if (!shouldSend) {
                    continue;
                }

                const [startHH] = (s.startTime || "08:00").split(":");
                const [endHH] = (s.endTime || "22:00").split(":");
                const start = Number(startHH || 0);
                const end = Number(endHH || 23);
                const hour = now.getHours();

                if (hour < start || hour > end) {
                    continue;
                }

                try {
                    const subj = `Nhắc nhở uống nước - FitTrack`;
                    const body = `Hi ${user.fullName || "user"},\n\nĐã đến hẹn uống nước rồi bạn nhé.\n\n— FitTrack`;
                    await sendMail({ to: user.email, subject: subj, text: body });
                    await markLastSent(s.userId, new Date());
                    console.log(`[scheduler] Sent reminder email to ${who} at ${now.toISOString()}`);
                } catch (err) {
                    console.error(`[scheduler] Failed sending reminder to ${who}:`, err.message || err);
                }
            }
        } catch (err) {
            console.error("[scheduler] error", err);
        }
    });

    console.log("Scheduler started: checking notification settings every minute");
}

export default startScheduler;
