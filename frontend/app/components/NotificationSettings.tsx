import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useApp } from "../app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, shadow } from "../theme";

type Setting = {
    enabled?: boolean;
    intervalHours?: number;
    intervalUnit?: "hour" | "minute";
    startTime?: string;
    endTime?: string;
};

export function NotificationSettings({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { authFetch } = useApp();
    const [loading, setLoading] = useState(false);
    const [setting, setSetting] = useState<Setting>({ enabled: true, intervalHours: 3, intervalUnit: "hour", startTime: "08:00", endTime: "22:00" });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            try {
                const res = await authFetch("/api/notification");
                if (!res) {
                    return;
                }

                if (!res.ok) {
                    return;
                }

                const body = (await res.json()) as any;
                if (mounted && body && body.data && body.data.setting) {
                    setSetting(body.data.setting);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        if (visible) {
            void load();
        }

        return () => {
            mounted = false;
        };
    }, [authFetch, visible]);

    async function save() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await authFetch("/api/notification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(setting),
            });

            if (!res) {
                setError("Lỗi mạng");
                Toast.show({ type: "error", text1: "Thông báo", text2: "Không thể kết nối máy chủ" });
                return;
            }

            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as any;
                const message = body.message || "Lưu thất bại";
                setError(message);
                Toast.show({ type: "error", text1: "Thông báo", text2: message });
                return;
            }

            const message = "Đã lưu cài đặt thông báo";
            setSuccess(message);
            Toast.show({ type: "success", text1: "Thông báo", text2: message });
            onClose();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            setError("Lỗi mạng");
            Toast.show({ type: "error", text1: "Thông báo", text2: "Lỗi mạng" });
        } finally {
            setLoading(false);
        }
    }

    async function removeSetting() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await authFetch("/api/notification", { method: "DELETE" });
            if (!res || !res.ok) {
                const message = "Không thể xóa cài đặt";
                setError(message);
                Toast.show({ type: "error", text1: "Thông báo", text2: message });
                return;
            }

            const message = "Đã xóa cài đặt thông báo";
            setSuccess(message);
            Toast.show({ type: "success", text1: "Thông báo", text2: message });
            onClose();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            setError("Lỗi mạng");
            Toast.show({ type: "error", text1: "Thông báo", text2: "Lỗi mạng" });
        } finally {
            setLoading(false);
        }
    }

    async function sendTestEmail() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await authFetch("/api/notification/test-email", { method: "POST" });
            if (!res) {
                setError("Lỗi mạng");
                Toast.show({ type: "error", text1: "Thông báo", text2: "Không thể kết nối máy chủ" });
                return;
            }

            const body = (await res.json().catch(() => ({}))) as any;
            if (!res.ok) {
                const message = body.message || "Không thể gửi email kiểm tra";
                setError(message);
                Toast.show({ type: "error", text1: "Thông báo", text2: message });
            } else {
                const message = body.message || "Email kiểm tra đã gửi";
                setSuccess(message);
                Toast.show({ type: "success", text1: "Thông báo", text2: message });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            setError("Lỗi mạng");
            Toast.show({ type: "error", text1: "Thông báo", text2: "Lỗi mạng" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Cài đặt thông báo</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Bật</Text>
                        <Switch value={!!setting.enabled} onValueChange={(value) => setSetting((current) => ({ ...current, enabled: value }))} />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Khoảng thời gian nhắc nhở</Text>
                        <View style={styles.intervalRow}>
                            <Input value={String(setting.intervalHours ?? 3)} onChangeText={(text) => setSetting((current) => ({ ...current, intervalHours: Number(text) }))} keyboardType="numeric" style={[styles.input, styles.intervalInput]} />
                            <View style={styles.unitSelector}>
                                <Pressable
                                    onPress={() => setSetting((current) => ({ ...current, intervalUnit: "hour" }))}
                                    style={[styles.unitPill, (setting.intervalUnit ?? "hour") === "hour" && styles.unitPillActive]}
                                >
                                    <Text style={[styles.unitPillText, (setting.intervalUnit ?? "hour") === "hour" && styles.unitPillTextActive]}>Giờ</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setSetting((current) => ({ ...current, intervalUnit: "minute" }))}
                                    style={[styles.unitPill, setting.intervalUnit === "minute" && styles.unitPillActive]}
                                >
                                    <Text style={[styles.unitPillText, setting.intervalUnit === "minute" && styles.unitPillTextActive]}>Phút</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View style={styles.rowGap}>
                        <View style={styles.fieldHalf}>
                            <Text style={styles.label}>Giờ bắt đầu</Text>
                            <Input value={setting.startTime ?? "08:00"} onChangeText={(text) => setSetting((current) => ({ ...current, startTime: text }))} style={styles.input} />
                        </View>
                        <View style={styles.fieldHalf}>
                            <Text style={styles.label}>Giờ kết thúc</Text>
                            <Input value={setting.endTime ?? "22:00"} onChangeText={(text) => setSetting((current) => ({ ...current, endTime: text }))} style={styles.input} />
                        </View>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    {success ? <Text style={styles.success}>{success}</Text> : null}

                    <View style={styles.actions}>
                        <Button variant="outline" onPress={sendTestEmail} title={loading ? "..." : "Gửi email thử"} style={styles.actionButton} />
                        <Button variant="outline" onPress={removeSetting} title="Xóa" style={styles.actionButton} />
                        <Button onPress={save} title="Lưu" style={styles.actionButtonPrimary} />
                    </View>

                    {loading ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>Đóng</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

export default NotificationSettings;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.46)",
        justifyContent: "center",
        padding: 20,
    },
    card: {
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.foreground,
        marginBottom: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    rowGap: {
        flexDirection: "row",
        gap: 10,
    },
    field: {
        gap: 8,
        marginBottom: 12,
    },
    intervalRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    intervalInput: {
        flex: 1,
    },
    unitSelector: {
        flexDirection: "row",
        backgroundColor: colors.mutedSoft,
        borderRadius: 12,
        padding: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    unitPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9,
    },
    unitPillActive: {
        backgroundColor: colors.primary,
    },
    unitPillText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.muted,
    },
    unitPillTextActive: {
        color: "#FFFFFF",
    },
    fieldHalf: {
        flex: 1,
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.muted,
    },
    input: {
        backgroundColor: colors.mutedSoft,
    },
    error: {
        marginTop: 4,
        fontSize: 13,
        color: colors.destructive,
    },
    success: {
        marginTop: 4,
        fontSize: 13,
        color: colors.success,
    },
    actions: {
        marginTop: 14,
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    actionButton: {
        flexGrow: 1,
        flexBasis: "30%",
    },
    actionButtonPrimary: {
        flexGrow: 1,
        flexBasis: "30%",
        backgroundColor: colors.primary,
    },
    spinner: {
        marginTop: 12,
    },
    closeButton: {
        marginTop: 12,
        alignSelf: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    closeText: {
        color: colors.primary,
        fontWeight: "700",
    },
});
