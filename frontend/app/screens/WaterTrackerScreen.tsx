import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { Button } from "@/components/ui/button";
import { colors, shadow } from "../theme";

const waterOptions = [
    { amount: 150, label: "150ml", icon: "cup-water" },
    { amount: 250, label: "250ml", icon: "cup" },
    { amount: 350, label: "350ml", icon: "water" },
    { amount: 500, label: "500ml", icon: "water-plus" },
] as const;

export function WaterTrackerScreen() {
    const { healthData, addWater, setScreen, authFetch } = useApp();
    const [overrideGoal, setOverrideGoal] = useState<number | null>(null);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customAmount, setCustomAmount] = useState("");

    const effectiveGoal = overrideGoal ?? healthData.waterGoal;
    const hasWaterGoal = effectiveGoal > 0;
    const percentage = hasWaterGoal ? Math.round((healthData.waterIntake / effectiveGoal) * 100) : 0;
    const remaining = hasWaterGoal ? Math.max(0, effectiveGoal - healthData.waterIntake) : 0;
    const waterLevel = Math.min(percentage, 100);

    const pad = (value: number) => String(value).padStart(2, "0");

    const isSameLocalDay = (dateString: string) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return false;
        }

        const today = new Date();
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    const formatLogDate = (dateString: string) => {
        if (!dateString) {
            return "";
        }

        if (dateString === "Now") {
            return "Bây giờ";
        }

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        if (isSameLocalDay(dateString)) {
            return time;
        }

        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${time}`;
    };

    const logs = (Array.isArray(healthData.waterHistory) ? healthData.waterHistory : [])
        .filter((log) => log.date === "Now" || isSameLocalDay(String(log.date)))
        .sort((left, right) => {
            const leftDate = new Date(left.date);
            const rightDate = new Date(right.date);
            const leftTime = Number.isNaN(leftDate.getTime()) ? 0 : leftDate.getTime();
            const rightTime = Number.isNaN(rightDate.getTime()) ? 0 : rightDate.getTime();
            return leftTime - rightTime;
        });

    useEffect(() => {
        let mounted = true;

        async function loadGoals() {
            if (!authFetch) return;
            try {
                const res = await authFetch("/api/goals");
                if (!res || !res.ok) return;
                const body = (await res.json()) as any;
                const serverGoals = Array.isArray(body.data?.goals) ? body.data.goals : [];
                for (const g of serverGoals) {
                    const unit = g.unit ?? "";
                    const title = String(g.title || "").toLowerCase();
                    const target = String(g.target || "").toLowerCase();
                    if (unit === "ml" || title.includes("nước") || title.includes("nuoc") || target.includes("ml")) {
                        const parsedTarget = Number(String(g.target ?? "").replace(/[^0-9.]/g, ""));
                        const parsedMax = Number(String(g.max ?? "").replace(/[^0-9.]/g, ""));
                        const val = Number.isFinite(parsedTarget) && parsedTarget > 1 ? parsedTarget : Number.isFinite(parsedMax) && parsedMax > 1 ? parsedMax : null;
                        if (mounted && val) {
                            setOverrideGoal(val);
                            return;
                        }
                    }
                }
                // No water goal in goals — clear override so healthData.waterGoal is used
                if (mounted) setOverrideGoal(null);
            } catch (err) {
                // noop
            }
        }

        // Always fetch latest goals to pick up any edits the user made
        void loadGoals();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authFetch]);

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={() => setScreen("dashboard")} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Theo dõi nước</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.meterSection}>
                    <View style={styles.bottleWrap}>
                        <View style={styles.bottle}>
                            <View style={[styles.waterFill, { height: `${waterLevel}%` }]}>
                                <View style={styles.wave} />
                            </View>
                            {waterLevel > 20 ? <View style={styles.bubble1} /> : null}
                            {waterLevel > 20 ? <View style={styles.bubble2} /> : null}
                            {waterLevel > 20 ? <View style={styles.bubble3} /> : null}
                        </View>
                        <MaterialCommunityIcons name="water-outline" size={34} color={colors.secondary} style={styles.bottleIcon} />
                    </View>

                    <Text style={styles.amount}>{hasWaterGoal || healthData.waterIntake > 0 ? `${healthData.waterIntake}ml` : "-"}</Text>
                    <Text style={styles.subtitle}>{hasWaterGoal ? `trong mục tiêu hàng ngày ${effectiveGoal}ml` : "Chưa có mục tiêu nước"}</Text>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <View style={[styles.summaryDot, { backgroundColor: colors.secondary }]} />
                            <Text style={styles.summaryText}>{hasWaterGoal ? `${percentage}% hoàn thành` : "Chưa có dữ liệu"}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <View style={[styles.summaryDot, { backgroundColor: colors.muted }]} />
                            <Text style={styles.summarySecondary}>{hasWaterGoal ? `${remaining}ml còn lại` : "-"}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thêm nhanh</Text>
                    <View style={styles.quickGrid}>
                        {waterOptions.map((option) => (
                            <Button key={option.amount} variant="outline" onPress={() => addWater(option.amount)} style={styles.quickButton} contentStyle={styles.quickContent}>
                                <MaterialCommunityIcons name={option.icon as any} size={24} color={colors.secondary} />
                                <Text style={styles.quickLabel}>{option.label}</Text>
                            </Button>
                        ))}
                    </View>
                </View>

                <Pressable onPress={() => { setCustomAmount(""); setShowCustomModal(true); }} style={styles.customButton}>
                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.customButtonText}>Thêm lượng tùy chỉnh</Text>
                </Pressable>

                {/* Custom amount modal */}
                <Modal visible={showCustomModal} transparent animationType="fade" onRequestClose={() => setShowCustomModal(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Nhập lượng nước</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.amountInput}
                                    value={customAmount}
                                    onChangeText={setCustomAmount}
                                    placeholder="VD: 350"
                                    placeholderTextColor={colors.muted}
                                    keyboardType="numeric"
                                    autoFocus
                                />
                                <Text style={styles.inputUnit}>ml</Text>
                            </View>
                            <View style={styles.modalActions}>
                                <Pressable onPress={() => setShowCustomModal(false)} style={styles.cancelBtn}>
                                    <Text style={styles.cancelText}>Hủy</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        const parsed = Number(customAmount.trim());
                                        if (!Number.isFinite(parsed) || parsed <= 0) {
                                            Alert.alert("Lỗi", "Vui lòng nhập số ml hợp lệ (lớn hơn 0).");
                                            return;
                                        }
                                        void addWater(parsed);
                                        setShowCustomModal(false);
                                        setCustomAmount("");
                                    }}
                                    style={styles.confirmBtn}
                                >
                                    <Text style={styles.confirmText}>Thêm</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Nhật ký hôm nay</Text>
                    <View style={styles.logList}>
                        {logs.map((log: any, index: number) => (
                            <View key={`${log.date}-${index}`} style={styles.logRow}>
                                <View style={styles.logLeft}>
                                    <View style={styles.logIcon}>
                                        <MaterialCommunityIcons name="water-outline" size={18} color={colors.secondary} />
                                    </View>
                                    <Text style={styles.logDate}>{formatLogDate(String(log.date))}</Text>
                                </View>
                                <Text style={styles.logAmount}>+{log.amount}ml</Text>
                            </View>
                        ))}
                        {!logs.length ? <Text style={styles.emptyText}>Chưa có dữ liệu hôm nay.</Text> : null}
                    </View>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.mutedSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.foreground,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 124,
        gap: 16,
    },
    meterSection: {
        alignItems: "center",
    },
    bottleWrap: {
        width: 160,
        height: 228,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    bottle: {
        position: "absolute",
        inset: 0,
        width: 144,
        height: 208,
        borderRadius: 22,
        borderWidth: 4,
        borderColor: "rgba(20, 184, 166, 0.28)",
        overflow: "hidden",
        backgroundColor: colors.card,
    },
    waterFill: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.secondary,
    },
    wave: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 16,
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    bottleIcon: {
        position: "absolute",
        top: -6,
    },
    bubble1: {
        position: "absolute",
        bottom: 44,
        left: 26,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    bubble2: {
        position: "absolute",
        bottom: 78,
        right: 34,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    bubble3: {
        position: "absolute",
        bottom: 58,
        left: 58,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    amount: {
        fontSize: 40,
        fontWeight: "800",
        color: colors.foreground,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: colors.muted,
    },
    summaryRow: {
        marginTop: 16,
        flexDirection: "row",
        gap: 16,
    },
    summaryItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    summaryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    summaryText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.foreground,
    },
    summarySecondary: {
        fontSize: 13,
        color: colors.muted,
    },
    card: {
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    sectionTitle: {
        marginBottom: 12,
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
    },
    quickGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    quickButton: {
        width: "48%",
        minHeight: 72,
        borderRadius: 18,
        borderColor: colors.border,
    },
    quickContent: {
        flexDirection: "column",
        gap: 6,
    },
    quickLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
    },
    customButton: {
        backgroundColor: colors.secondary,
        borderRadius: 18,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    customButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    logList: {
        gap: 10,
    },
    logRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148,163,184,0.12)",
    },
    logLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.secondarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    logDate: {
        fontSize: 13,
        color: colors.muted,
    },
    logAmount: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.foreground,
    },
    emptyText: {
        fontSize: 13,
        color: colors.muted,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.45)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    modalCard: {
        width: "100%",
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 22,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.foreground,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.mutedSoft,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 20,
    },
    amountInput: {
        flex: 1,
        fontSize: 28,
        fontWeight: "800",
        color: colors.foreground,
        paddingVertical: 12,
    },
    inputUnit: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.muted,
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: colors.mutedSoft,
        alignItems: "center",
    },
    cancelText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.muted,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: colors.secondary,
        alignItems: "center",
    },
    confirmText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
