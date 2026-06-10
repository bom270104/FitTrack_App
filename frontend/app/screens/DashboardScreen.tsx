import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { colors, shadow } from "../theme";

export function DashboardScreen() {
    const { userData, healthData, setScreen } = useApp();

    const asNumber = (value: any, fallback = 0) => {
        if (value == null) return fallback;
        if (typeof value === "number") return value;
        if (typeof value === "string" && value.trim() !== "") return Number(value) || fallback;
        return fallback;
    };

    const hasBmi = asNumber(healthData.bmi) > 0;
    const hasCalories = asNumber(healthData.calorieGoal) > 0 || asNumber(healthData.dailyCalories) > 0 || asNumber(healthData.tdee) > 0;
    const hasWater = asNumber(healthData.waterGoal) > 0 || asNumber(healthData.waterIntake) > 0;
    const hasWeightGoal = asNumber(userData?.weight) > 0 && asNumber(healthData.targetWeight) > 0;
    const waterPercentage = hasWater && asNumber(healthData.waterGoal) > 0 ? Math.round((asNumber(healthData.waterIntake) / asNumber(healthData.waterGoal)) * 100) : 0;
    const caloriePercentage = hasCalories && asNumber(healthData.calorieGoal) > 0 ? Math.round((asNumber(healthData.dailyCalories) / asNumber(healthData.calorieGoal)) * 100) : 0;
    const userWeightNum = asNumber(userData?.weight);
    const weightProgress = hasWeightGoal ? Math.round(((userWeightNum - asNumber(healthData.currentWeight)) / Math.max(1, userWeightNum - asNumber(healthData.targetWeight))) * 100) : 0;

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Chào buổi sáng</Text>
                    <Text style={styles.name}>{userData?.name ?? ""}</Text>
                </View>
                <View style={styles.bellButton}>
                    <MaterialCommunityIcons name="bell-outline" size={20} color={colors.foreground} />
                    <View style={styles.notificationDot} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Pressable onPress={() => setScreen("bmi")} style={({ pressed }) => [styles.bmiHero, pressed && styles.pressed]}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.bmiGradient}>
                        <View style={styles.heroRow}>
                            <View>
                                <Text style={styles.heroLabel}>BMI của bạn</Text>
                                <View style={styles.heroValueRow}>
                                    <Text style={styles.heroValue}>{hasBmi ? String(healthData.bmi) : "-"}</Text>
                                    <Text style={styles.heroUnit}>kg/m2</Text>
                                </View>
                            </View>
                            <View style={styles.heroIcon}>
                                <MaterialCommunityIcons name="target" size={26} color="#FFFFFF" />
                            </View>
                        </View>
                        <View style={styles.heroFooter}>
                            <Text style={styles.heroPill}>{hasBmi ? "Bình thường" : "Chưa có dữ liệu"}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.8)" style={styles.heroChevron} />
                        </View>
                    </LinearGradient>
                </Pressable>

                <View style={styles.gridRow}>
                    <Pressable onPress={() => setScreen("statistics")} style={({ pressed }) => [styles.metricCard, pressed && styles.pressed]}>
                        <View style={styles.metricTopRow}>
                            <View style={[styles.metricIcon, styles.accentIcon]}>
                                <MaterialCommunityIcons name="fire" size={18} color={colors.accent} />
                            </View>
                            <Text style={styles.metricTag}>Calo</Text>
                        </View>
                        <Text style={styles.metricValue}>{hasCalories ? String(healthData.dailyCalories) : "-"}</Text>
                        <Text style={styles.metricSub}>{hasCalories ? `/ ${String(healthData.calorieGoal)}` : "Chưa có dữ liệu"}</Text>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${Math.min(caloriePercentage, 100)}%`, backgroundColor: colors.accent }]} />
                        </View>
                    </Pressable>

                    <Pressable onPress={() => setScreen("water")} style={({ pressed }) => [styles.metricCard, pressed && styles.pressed]}>
                        <View style={styles.metricTopRow}>
                            <View style={[styles.metricIcon, styles.secondaryIcon]}>
                                <MaterialCommunityIcons name="water-outline" size={18} color={colors.secondary} />
                            </View>
                            <Text style={styles.metricTag}>Nước</Text>
                        </View>
                        <Text style={styles.metricValue}>{hasWater ? String(healthData.waterIntake) : "-"}</Text>
                        <Text style={styles.metricSub}>{hasWater ? `/ ${String(healthData.waterGoal)} ml` : "Chưa có dữ liệu"}</Text>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${Math.min(waterPercentage, 100)}%`, backgroundColor: colors.secondary }]} />
                        </View>
                    </Pressable>
                </View>

                <Pressable onPress={() => setScreen("goals")} style={({ pressed }) => [styles.goalCard, pressed && styles.pressed]}>
                    <View style={styles.goalHeader}>
                        <View style={styles.goalHeaderLeft}>
                            <View style={styles.goalIcon}>
                                <MaterialCommunityIcons name="trending-down" size={22} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.goalTitle}>Mục tiêu cân nặng</Text>
                                <Text style={styles.goalSubtitle}>{hasWeightGoal ? `${String(userData?.weight)}kg → ${String(healthData.targetWeight)}kg` : "Chưa có dữ liệu"}</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
                    </View>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Tiến độ</Text>
                        <Text style={styles.progressPercent}>{Math.max(0, weightProgress)}%</Text>
                    </View>
                    <View style={styles.goalProgressTrack}>
                        <View style={[styles.goalProgressFill, { width: `${Math.max(0, Math.min(weightProgress, 100))}%` }]} />
                    </View>
                </Pressable>

                <View style={styles.energyCard}>
                    <Text style={styles.sectionTitle}>Năng lượng tiêu thụ hàng ngày</Text>
                    <View style={styles.energyRow}>
                        <View>
                            <Text style={styles.energyValue}>{hasCalories ? String(healthData.tdee) : "-"}</Text>
                            <Text style={styles.energySub}>kcal/ngày (TDEE)</Text>
                        </View>
                        <View style={styles.energyRight}>
                            <Text style={styles.energyRightValue}>{hasCalories ? "-200 cal" : "-"}</Text>
                            <Text style={styles.energyRightSub}>{hasCalories ? "thâm hụt để giảm cân" : "Chưa có dữ liệu"}</Text>
                        </View>
                    </View>
                    <Pressable onPress={() => setScreen("calories")} style={styles.tdeeButton}>
                        <View style={styles.tdeeButtonLeft}>
                            <View style={styles.tdeeIcon}>
                                <MaterialCommunityIcons name="calculator-variant-outline" size={18} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.tdeeTitle}>Mở máy tính TDEE</Text>
                                <Text style={styles.tdeeSub}>Tính calo cho tăng, giảm hoặc giữ cân</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
                    </Pressable>
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    greeting: {
        fontSize: 13,
        color: colors.muted,
    },
    name: {
        marginTop: 4,
        fontSize: 20,
        fontWeight: "800",
        color: colors.foreground,
    },
    bellButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
        ...shadow,
    },
    notificationDot: {
        position: "absolute",
        top: 8,
        right: 9,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.destructive,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 124,
        gap: 16,
    },
    bmiHero: {
        borderRadius: 28,
        overflow: "hidden",
    },
    bmiGradient: {
        padding: 20,
    },
    heroRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22,
    },
    heroLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "rgba(255,255,255,0.82)",
    },
    heroValueRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
        marginTop: 6,
    },
    heroValue: {
        fontSize: 42,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    heroUnit: {
        fontSize: 14,
        color: "rgba(255,255,255,0.72)",
    },
    heroIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    heroFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    heroPill: {
        backgroundColor: "rgba(255,255,255,0.18)",
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        overflow: "hidden",
    },
    heroChevron: {
        marginLeft: "auto",
    },
    gridRow: {
        flexDirection: "row",
        gap: 12,
    },
    metricCard: {
        flex: 1,
        borderRadius: 22,
        backgroundColor: colors.card,
        padding: 16,
        ...shadow,
    },
    metricTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    metricIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    accentIcon: {
        backgroundColor: colors.accentSoft,
    },
    secondaryIcon: {
        backgroundColor: colors.secondarySoft,
    },
    metricTag: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.muted,
    },
    metricValue: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.foreground,
    },
    metricSub: {
        marginTop: 2,
        fontSize: 12,
        color: colors.muted,
    },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: "#E2E8F0",
        marginTop: 12,
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
    },
    goalCard: {
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    goalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    goalHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    goalIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primarySoft,
    },
    goalTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.foreground,
    },
    goalSubtitle: {
        marginTop: 2,
        fontSize: 12,
        color: colors.muted,
    },
    progressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
        color: colors.muted,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.primary,
    },
    goalProgressTrack: {
        height: 12,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: "#E2E8F0",
    },
    goalProgressFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: colors.primary,
    },
    energyCard: {
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
    energyRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    energyValue: {
        fontSize: 32,
        fontWeight: "800",
        color: colors.foreground,
    },
    energySub: {
        marginTop: 2,
        fontSize: 12,
        color: colors.muted,
    },
    energyRight: {
        alignItems: "flex-end",
    },
    energyRightValue: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
    energyRightSub: {
        marginTop: 4,
        fontSize: 12,
        color: colors.muted,
    },
    tdeeButton: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 18,
        backgroundColor: colors.mutedSoft,
        padding: 14,
    },
    tdeeButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    tdeeIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    tdeeTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
    },
    tdeeSub: {
        marginTop: 2,
        fontSize: 12,
        color: colors.muted,
    },
    pressed: {
        opacity: 0.96,
        transform: [{ scale: 0.995 }],
    },
});
