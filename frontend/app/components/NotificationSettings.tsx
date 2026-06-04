"use client";

import { useEffect, useState } from "react";

type Setting = {
    enabled?: boolean;
    intervalHours?: number;
    startTime?: string;
    endTime?: string;
};

function getAuthHeaders() {
    const t = typeof window !== "undefined" ? localStorage.getItem("ft_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (t) {
        headers.Authorization = `Bearer ${t}`;
    }
    return headers;
}

export function NotificationSettings({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [setting, setSetting] = useState<Setting>({ enabled: true, intervalHours: 3, startTime: "08:00", endTime: "22:00" });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:5000/api/notification", { headers: getAuthHeaders() });
                if (!res.ok) {
                    setLoading(false);
                    return;
                }
                const body = await res.json();
                if (mounted && body && body.data && body.data.setting) {
                    setSetting(body.data.setting);
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    async function save() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("http://localhost:5000/api/notification", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(setting),
            });
            if (!res.ok) {
                const b = await res.json().catch(() => ({}));
                setError(b.message || "Save failed");
                setLoading(false);
                return;
            }
            setLoading(false);
            setSuccess("Notification setting saved");
            onClose();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setError("Network error");
            setLoading(false);
        }
    }

    async function removeSetting() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("http://localhost:5000/api/notification", { method: "DELETE", headers: getAuthHeaders() });
            if (!res.ok) {
                setLoading(false);
                return;
            }
            setLoading(false);
            setSuccess("Notification setting removed");
            onClose();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setLoading(false);
        }
    }

    async function sendTestEmail() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("http://localhost:5000/api/notification/test-email", {
                method: "POST",
                headers: getAuthHeaders(),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(body.message || "Unable to send test email");
            } else {
                setSuccess(body.message || "Test email sent");
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[min(640px,95%)] rounded-2xl bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Notification Settings</h3>

                <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm">Enabled</label>
                    <input type="checkbox" checked={!!setting.enabled} onChange={(e) => setSetting({ ...setting, enabled: e.target.checked })} />
                </div>

                <div className="mb-3">
                    <label className="text-sm">Interval (hours)</label>
                    <input className="ml-3 w-20 rounded border px-2 py-1" type="number" min={1} value={setting.intervalHours ?? 3} onChange={(e) => setSetting({ ...setting, intervalHours: Number(e.target.value) })} />
                </div>

                <div className="mb-3 flex gap-4">
                    <div>
                        <label className="text-sm">Start Time</label>
                        <input className="ml-3 rounded border px-2 py-1" type="time" value={setting.startTime ?? "08:00"} onChange={(e) => setSetting({ ...setting, startTime: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm">End Time</label>
                        <input className="ml-3 rounded border px-2 py-1" type="time" value={setting.endTime ?? "22:00"} onChange={(e) => setSetting({ ...setting, endTime: e.target.value })} />
                    </div>
                </div>

                {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
                {success && <p className="mb-2 text-sm text-green-600">{success}</p>}

                <div className="mt-4 flex justify-end gap-3">
                    <button className="rounded-md border px-4 py-2" onClick={sendTestEmail} disabled={loading}>
                        Send Test Email
                    </button>
                    <button className="rounded-md border px-4 py-2" onClick={removeSetting} disabled={loading}>
                        Remove
                    </button>
                    <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={save} disabled={loading}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotificationSettings;
