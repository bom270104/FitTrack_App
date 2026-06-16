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
                const intervalHours = Number(s.intervalHours || 3);
                const shouldSend = !lastSentAt || (now.getTime() - lastSentAt.getTime()) >= intervalHours * 60 * 60 * 1000;

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
                    const subj = `Reminder: time to drink water — FitTrack`;
                    const body = `Hi ${user.fullName || "user"},\n\n Đây là lời nhắc nhở thân thiện về việc uống nước, hãy duy trì thói quen tốt cho sức khỏe của bạn !\n\n— FitTrack`;
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
