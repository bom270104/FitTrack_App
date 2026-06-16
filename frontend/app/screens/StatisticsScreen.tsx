import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { colors, shadow } from "../theme";

export function StatisticsScreen() {
    const { healthData, setScreen } = useApp();
    const [range, setRange] = useState<"Week" | "Month" | "Year">("Week");

    const derivedStats = useMemo(() => {
        const weights = healthData.weightHistory || [];
        const waters = healthData.waterHistory || [];
        const avgWeight = weights.length ? weights.reduce((sum, item) => sum + Number(item.weight || 0), 0) / weights.length : healthData.currentWeight;
        const avgWater = waters.length ? waters.reduce((sum, item) => sum + Number(item.amount || 0), 0) / waters.length : healthData.waterIntake;
        const bmiChange = weights.length > 1 ? Number((weights[weights.length - 1].weight - weights[0].weight).toFixed(1)) : 0;

        return [
            { label: "Cân nặng", value: avgWeight.toFixed(1), unit: "kg", change: `${bmiChange <= 0 ? "" : "+"}${bmiChange.toFixed(1)}kg`, positive: bmiChange <= 0, icon: "scale-balance", tint: colors.primarySoft, color: colors.primary },
            { label: "Nước", value: Math.round(avgWater).toLocaleString(), unit: "ml", change: avgWater >= healthData.waterGoal ? "Đạt mục tiêu" : "Chưa đạt", positive: avgWater >= healthData.waterGoal, icon: "water-outline", tint: colors.secondarySoft, color: colors.secondary },
            { label: "Calo TB", value: Math.round(healthData.dailyCalories).toLocaleString(), unit: "kcal", change: `${healthData.calorieGoal - healthData.dailyCalories >= 0 ? "-" : "+"}${Math.abs(healthData.calorieGoal - healthData.dailyCalories)}`, positive: healthData.dailyCalories <= healthData.calorieGoal, icon: "fire", tint: colors.accentSoft, color: colors.accent },
            { label: "Thay đổi BMI", value: Number(healthData.bmi).toFixed(1), unit: "kg/m2", change: "BMI hiện tại", positive: true, icon: "trending-down", tint: "rgba(139,92,246,0.10)", color: "#8B5CF6" },
        ];
    }, [healthData]);

    const chartWeightData = useMemo(() => {
        const items = (healthData.weightHistory || []).slice().sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
        if (range === "Week") return items.slice(-7);
        if (range === "Month") return items.slice(-30);
        return items;
    }, [healthData.weightHistory, range]);

    const chartWaterData = useMemo(() => {
        const items = (healthData.waterHistory || []).slice().sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
        if (range === "Week") return items.slice(-7);
        if (range === "Month") return items.slice(-30);
        return items;
    }, [healthData.waterHistory, range]);

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={() => setScreen("dashboard")} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Thống kê</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.rangeRow}>
                    {(["Week", "Month", "Year"] as const).map((item) => (
                        <Pressable key={item} onPress={() => setRange(item)} style={[styles.rangePill, range === item && styles.rangePillActive]}>
                            <Text style={[styles.rangeText, range === item && styles.rangeTextActive]}>{item === "Week" ? "Tuần" : item === "Month" ? "Tháng" : "Năm"}</Text>
                        </Pressable>
                    ))}
                </View>

                <ChartCard title="Tiến trình cân nặng">
                    <LineChart data={chartWeightData} color={colors.primary} />
                </ChartCard>

                <ChartCard title="Lượng nước">
                    <BarChart data={chartWaterData} color={colors.secondary} />
                </ChartCard>

                <View style={styles.grid}>
                    {derivedStats.map((stat) => (
                        <View key={stat.label} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.tint }]}>
                                <MaterialCommunityIcons name={stat.icon as any} size={18} color={stat.color} />
                            </View>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <View style={styles.statValueRow}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statUnit}>{stat.unit}</Text>
                            </View>
                            <Text style={[styles.statChange, stat.positive ? styles.positive : styles.negative]}>{stat.change}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{title}</Text>
            <View style={styles.chartFrame}>{children}</View>
        </View>
    );
}

const formatChartLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return date.getHours() || date.getMinutes() ? `${day}/${month} ${hours}:${minutes}` : `${day}/${month}`;
};

function LineChart({ data, color }: { data: Array<{ date: string; weight: number }>; color: string }) {
    const values = data.map((item) => Number(item.weight || 0));
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = Math.max(1, max - min);

    return (
        <View style={styles.chartArea}>
            <View style={styles.linePlot}>
                {data.map((item, index) => {
                    const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
                    const y = 100 - ((Number(item.weight || 0) - min) / range) * 100;
                    return <View key={`${item.date}-${index}`} style={[styles.lineDot, { left: `${x}%`, top: `${y}%`, backgroundColor: color }]} />;
                })}
                {data.map((item, index) => {
                    if (index === data.length - 1) return null;
                    const x1 = (index / (data.length - 1)) * 100;
                    const x2 = ((index + 1) / (data.length - 1)) * 100;
                    const y1 = 100 - ((Number(item.weight || 0) - min) / range) * 100;
                    const y2 = 100 - ((Number(data[index + 1].weight || 0) - min) / range) * 100;
                    const width = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
                    return <View key={`${item.date}-${index}-line`} style={[styles.lineSegment, { left: `${x1}%`, top: `${y1}%`, width: `${width}%`, transform: [{ rotate: `${angle}deg` }], backgroundColor: color }]} />;
                })}
            </View>
            <View style={styles.axisRow}>
                {data.map((item, index) => (
                    <Text key={`${item.date}-${index}`} style={styles.axisLabel}>{formatChartLabel(item.date)}</Text>
                ))}
            </View>
        </View>
    );
}

function BarChart({ data, color }: { data: Array<{ date: string; amount: number }>; color: string }) {
    const values = data.map((item) => Number(item.amount || 0));
    const max = Math.max(...values, 1);

    return (
        <View style={styles.chartArea}>
            <View style={styles.barPlot}>
                {data.map((item, index) => (
                    <View key={`${item.date}-${index}`} style={styles.barColumn}>
                        <View style={[styles.barFill, { height: `${(Number(item.amount || 0) / max) * 100}%`, backgroundColor: color }]} />
                    </View>
                ))}
            </View>
            <View style={styles.axisRow}>
                {data.map((item, index) => (
                    <Text key={`${item.date}-${index}`} style={styles.axisLabel}>{formatChartLabel(item.date)}</Text>
                ))}
            </View>
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
        gap: 14,
    },
    rangeRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 2,
    },
    rangePill: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 14,
        backgroundColor: colors.mutedSoft,
        alignItems: "center",
    },
    rangePillActive: {
        backgroundColor: colors.primary,
    },
    rangeText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.muted,
    },
    rangeTextActive: {
        color: "#FFFFFF",
    },
    chartCard: {
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    chartTitle: {
        marginBottom: 12,
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
    },
    chartFrame: {
        height: 180,
    },
    chartArea: {
        flex: 1,
    },
    linePlot: {
        flex: 1,
        position: "relative",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148,163,184,0.12)",
    },
    lineDot: {
        position: "absolute",
        width: 8,
        height: 8,
        marginLeft: -4,
        marginTop: -4,
        borderRadius: 4,
    },
    lineSegment: {
        position: "absolute",
        height: 2,
        transformOrigin: "left center",
    },
    axisRow: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    axisLabel: {
        flex: 1,
        textAlign: "center",
        fontSize: 10,
        color: colors.muted,
    },
    barPlot: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        paddingHorizontal: 4,
    },
    barColumn: {
        flex: 1,
        height: "100%",
        justifyContent: "flex-end",
        borderRadius: 12,
        backgroundColor: "rgba(148,163,184,0.10)",
        overflow: "hidden",
    },
    barFill: {
        width: "100%",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    statCard: {
        width: "48%",
        borderRadius: 22,
        backgroundColor: colors.card,
        padding: 16,
        ...shadow,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        color: colors.muted,
    },
    statValueRow: {
        marginTop: 6,
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.foreground,
    },
    statUnit: {
        fontSize: 12,
        color: colors.muted,
    },
    statChange: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: "600",
    },
    positive: {
        color: colors.primary,
    },
    negative: {
        color: colors.destructive,
    },
});