import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, shadow } from "../theme";

interface Goal {
    id: string;
    title: string;
    target: string;
    current: number;
    max: number;
    unit: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    tint: string;
    color: string;
    completed: boolean;
}

export function GoalsScreen() {
    const { healthData, userData, setScreen, authFetch } = useApp();
    const [goals, setGoals] = useState<Goal[]>([]);

    const [showAddGoal, setShowAddGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: "", target: "", unit: "kg" });
    const [showEditGoal, setShowEditGoal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const asNumber = (value: any, fallback = 0) => {
        if (value == null) return fallback;
        if (typeof value === "number") return value;
        if (typeof value === "string" && value.trim() !== "") return Number(value) || fallback;
        return fallback;
    };

    const buildWeightGoalFallback = (): Goal | null => {
        const targetWeightValue = asNumber(healthData?.targetWeight, asNumber(userData?.targetWeight));
        if (!targetWeightValue || targetWeightValue <= 0) {
            return null;
        }

        const currentWeightValue = asNumber(healthData?.currentWeight, asNumber(userData?.weight));
        return {
            id: "weight-goal",
            title: "Mục tiêu cân nặng",
            target: `${targetWeightValue} kg`,
            current: currentWeightValue,
            max: targetWeightValue,
            unit: "kg",
            icon: "target",
            tint: colors.primarySoft,
            color: colors.primary,
            completed: currentWeightValue > 0 && currentWeightValue === targetWeightValue,
        };
    };

    const loadGoals = async () => {
        try {
            const res = await authFetch("/api/goals");
            if (!res || !res.ok) return;
            const body = (await res.json()) as any;
            const serverGoals = Array.isArray(body.data?.goals) ? body.data.goals : [];
            const mapped: Goal[] = serverGoals.map((g: any) => {
                let unit = g.unit ?? "";
                const titleLower = String(g.title || "").toLowerCase();
                const targetLower = String(g.target || "").toLowerCase();
                const hasWeightLabel = titleLower.includes("cân") || titleLower.includes("tăng") || titleLower.includes("giảm") || targetLower.includes("kg");
                const hasWaterLabel = titleLower.includes("nước") || titleLower.includes("nuoc") || targetLower.includes("ml");
                const hasCalorieLabel = titleLower.includes("calo") || titleLower.includes("kcal") || targetLower.includes("kcal");

                if (!unit) {
                    if (hasWaterLabel) {
                        unit = "ml";
                    } else if (hasWeightLabel) {
                        unit = "kg";
                    } else if (hasCalorieLabel) {
                        unit = "kcal";
                    }
                }

                const parsedTarget = Number(String(g.target ?? "").replace(/[^0-9.]/g, ""));
                const targetValue = Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : undefined;
                let maxVal = Number.isFinite(Number(g.max)) ? Number(g.max) : undefined;
                if (targetValue) {
                    maxVal = targetValue;
                }

                const maxValNumber = Number.isFinite(Number(maxVal)) ? Number(maxVal) : 0;
                if (unit === "ml" && maxValNumber <= 1) {
                    maxVal = healthData?.waterGoal ?? 2000;
                }

                const finalMax = Number.isFinite(Number(maxVal)) ? Number(maxVal) : 1;
                const targetText = g.target ?? (unit === "ml" ? `${finalMax} ml` : unit === "kg" ? `${finalMax} kg` : String(finalMax));

                let currentVal = Number.isFinite(Number(g.current)) ? Number(g.current) : NaN;
                if (unit === "ml") {
                    if (!Number.isFinite(currentVal) || currentVal <= 0) {
                        currentVal = asNumber(healthData?.waterIntake);
                    }
                } else if (unit === "kg") {
                    if (!Number.isFinite(currentVal) || currentVal <= 0) {
                        currentVal = asNumber(healthData?.currentWeight, asNumber(userData?.weight));
                    }
                } else if (unit === "kcal") {
                    if (!Number.isFinite(currentVal) || currentVal <= 0) {
                        currentVal = asNumber(healthData?.dailyCalories);
                    }
                } else {
                    if (!Number.isFinite(currentVal) || currentVal <= 0) {
                        currentVal = asNumber(healthData?.currentWeight, asNumber(userData?.weight));
                    }
                }

                if (!Number.isFinite(currentVal)) {
                    currentVal = 0;
                }

                return {
                    id: g._id,
                    title: g.title ?? "",
                    target: targetText,
                    current: currentVal,
                    max: finalMax,
                    unit,
                    icon: g.icon || "target",
                    tint: g.tint || colors.primarySoft,
                    color: g.color || colors.primary,
                    completed: !!g.completed,
                };
            });
            const weightGoalFallback = buildWeightGoalFallback();
            const hasExistingWeightGoal = mapped.some((goal) =>
                goal.unit === "kg" ||
                goal.title.toLowerCase().includes("cân") ||
                goal.title.toLowerCase().includes("giảm") ||
                goal.title.toLowerCase().includes("tăng") ||
                String(goal.target).toLowerCase().includes("kg"),
            );

            setGoals(weightGoalFallback && !hasExistingWeightGoal ? [weightGoalFallback, ...mapped] : mapped);
        } catch (err) {
            // noop
        }
    };

    const addGoal = async () => {
        if (!newGoal.title.trim() || !newGoal.target.trim()) {
            return;
        }

        try {
            const res = await authFetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newGoal.title.trim(), target: newGoal.target.trim(), unit: newGoal.unit }),
            });

            if (!res || !res.ok) {
                setShowAddGoal(false);
                setNewGoal({ title: "", target: "", unit: "kg" });
                return;
            }

            const body = (await res.json()) as any;
            const g = body.data?.goal;
            if (g) {
                const mapped: Goal = {
                    id: g._id,
                    title: g.title ?? newGoal.title.trim(),
                    target: g.target ?? newGoal.target.trim(),
                    current: Number.isFinite(Number(g.current)) ? Number(g.current) : 0,
                    max: Number.isFinite(Number(g.max)) ? Number(g.max) : Number(String(newGoal.target).replace(/[^0-9.]/g, "")) || 1,
                    unit: g.unit ?? newGoal.unit,
                    icon: g.icon ?? "target",
                    tint: g.tint ?? colors.primarySoft,
                    color: g.color ?? colors.primary,
                    completed: !!g.completed,
                };
                setGoals((current) => [mapped, ...current]);
            }
        } catch (err) {
            // noop
        }

        setNewGoal({ title: "", target: "", unit: "kg" });
        setShowAddGoal(false);
    };

    const updateGoal = async () => {
        if (!editingGoal) return;
        try {
            const res = await authFetch(`/api/goals/${editingGoal.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editingGoal.title, target: editingGoal.target, unit: editingGoal.unit }),
            });
            if (!res || !res.ok) {
                setShowEditGoal(false);
                setEditingGoal(null);
                return;
            }
            const body = (await res.json()) as any;
            const g = body.data?.goal;
            if (g) {
                setGoals((current) => current.map((cg) => (cg.id === editingGoal.id ? { ...cg, title: g.title, target: g.target, unit: g.unit } : cg)));
            }
        } catch (err) {
            // noop
        }
        setShowEditGoal(false);
        setEditingGoal(null);
    };

    const confirmDeleteGoal = (goal: Goal) => {
        Alert.alert("Xóa mục tiêu", "Bạn có chắc muốn xóa mục tiêu này?", [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: "destructive", onPress: () => void deleteGoal(goal) },
        ]);
    };

    const deleteGoal = async (goal: Goal) => {
        try {
            const res = await authFetch(`/api/goals/${goal.id}`, { method: "DELETE" });
            if (!res || !res.ok) return;
            const body = (await res.json()) as any;
            // if success, remove from list
            setGoals((current) => current.filter((g) => g.id !== goal.id));
        } catch (err) {
            // noop
        }
    };

    React.useEffect(() => {
        void loadGoals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [healthData?.waterGoal, healthData?.waterIntake, healthData?.currentWeight, healthData?.targetWeight, userData?.targetWeight, userData?.weight]);

    const weeklyProgress = Math.round(
        goals.length > 0
            ? goals.reduce((sum, goal) => {
                const percent = goal.max > 0 ? Math.min(Math.max((goal.current / goal.max) * 100, 0), 100) : 0;
                return sum + percent;
            }, 0) / goals.length
            : 0,
    );

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => setScreen("dashboard")} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Mục tiêu</Text>
                </View>
                <Pressable onPress={() => setShowAddGoal((current) => !current)} style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.heroTop}>
                        <View>
                            <Text style={styles.heroLabel}>Tiến độ tuần</Text>
                            <Text style={styles.heroValue}>{weeklyProgress}%</Text>
                        </View>
                        <View style={styles.circularProgress}>
                            <View style={styles.circularTrack} />
                            <View style={[styles.circularCenter, { backgroundColor: colors.primary }]}>
                                <MaterialCommunityIcons name="target" size={24} color="#FFFFFF" />
                            </View>
                        </View>
                    </View>
                    <Text style={styles.heroCopy}>Bạn đang làm tốt! Hãy tiếp tục để đạt được mục tiêu.</Text>
                </View>

                <Modal visible={showAddGoal} transparent animationType="fade" onRequestClose={() => setShowAddGoal(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Thêm mục tiêu mới</Text>
                            <View style={styles.modalFields}>
                                <Input value={newGoal.title} onChangeText={(text) => setNewGoal((current) => ({ ...current, title: text }))} placeholder="Tiêu đề mục tiêu" />
                                <Input value={newGoal.target} onChangeText={(text) => setNewGoal((current) => ({ ...current, target: text }))} placeholder="Giá trị mục tiêu" />
                                <View style={styles.unitRow}>
                                    {(["kg", "ml", "kcal"] as const).map((unit) => {
                                        const active = newGoal.unit === unit;
                                        return (
                                            <Pressable key={unit} onPress={() => setNewGoal((current) => ({ ...current, unit }))} style={[styles.unitPill, active && styles.unitPillActive]}>
                                                <Text style={[styles.unitText, active && styles.unitTextActive]}>{unit}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                <View style={styles.modalActions}>
                                    <Button variant="outline" onPress={() => setShowAddGoal(false)} title="Hủy" style={styles.actionButton} />
                                    <Button onPress={addGoal} title="Thêm mục tiêu" style={styles.actionButtonPrimary} />
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={showEditGoal} transparent animationType="fade" onRequestClose={() => setShowEditGoal(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Chỉnh sửa mục tiêu</Text>
                            <View style={styles.modalFields}>
                                <Input value={editingGoal?.title ?? ""} onChangeText={(text) => setEditingGoal((cur) => cur ? { ...cur, title: text } : cur)} placeholder="Tiêu đề mục tiêu" />
                                <Input value={editingGoal?.target ?? ""} onChangeText={(text) => setEditingGoal((cur) => cur ? { ...cur, target: text } : cur)} placeholder="Giá trị mục tiêu" />
                                <View style={styles.unitRow}>
                                    {(["kg", "ml", "kcal"] as const).map((unit) => {
                                        const active = editingGoal?.unit === unit;
                                        return (
                                            <Pressable key={unit} onPress={() => setEditingGoal((cur) => cur ? { ...cur, unit } : cur)} style={[styles.unitPill, active && styles.unitPillActive]}>
                                                <Text style={[styles.unitText, active && styles.unitTextActive]}>{unit}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                <View style={styles.modalActions}>
                                    <Button variant="outline" onPress={() => { setShowEditGoal(false); setEditingGoal(null); }} title="Hủy" style={styles.actionButton} />
                                    <Button onPress={updateGoal} title="Lưu" style={styles.actionButtonPrimary} />
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.goalList}>
                    {goals.map((goal) => {
                        // fallback order: stored max > parsed numeric from target string > healthData.waterGoal (for ml) > default 2000/1
                        let displayMax = (goal.max && goal.max > 0) ? goal.max : 0;
                        if (!displayMax) {
                            // try parse number from target text
                            const parsed = Number(String(goal.target).replace(/[^0-9.]/g, ""));
                            if (Number.isFinite(parsed) && parsed > 0) displayMax = parsed;
                        }
                        if (!displayMax) {
                            displayMax = goal.unit === "ml" ? (healthData?.waterGoal ?? 2000) : Math.max(1, goal.max ?? 1);
                        }
                        const progress = Math.round((goal.current / displayMax) * 100);
                        return (
                            <View key={goal.id} style={styles.goalCard}>
                                <View style={styles.goalRow}>
                                    <View style={[styles.goalIcon, { backgroundColor: goal.tint }]}>
                                        <MaterialCommunityIcons name={goal.icon} size={22} color={goal.color} />
                                    </View>
                                    <View style={styles.goalBody}>
                                        <View style={styles.goalTitleRow}>
                                            <Text style={styles.goalTitle}>{goal.title}</Text>
                                            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                                <Pressable onPress={() => { setEditingGoal(goal); setShowEditGoal(true); }} style={{ marginRight: 8 }}>
                                                    <MaterialCommunityIcons name="pencil" size={18} color={colors.muted} />
                                                </Pressable>
                                                <Pressable onPress={() => confirmDeleteGoal(goal)}>
                                                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.destructive ?? "#E53E3E"} />
                                                </Pressable>
                                                {goal.completed ? <View style={styles.checkBadge}><MaterialCommunityIcons name="check" size={16} color="#FFFFFF" /></View> : null}
                                            </View>
                                        </View>
                                        <Text style={styles.goalTarget}>Mục tiêu: {goal.target}</Text>
                                        <View style={styles.progressMeta}>
                                            <Text style={styles.progressMetaText}>{goal.current} / {displayMax} {goal.unit}</Text>
                                            <Text style={[styles.progressMetaText, goal.completed && styles.progressDone]}>{isFinite(progress) ? `${progress}%` : "0%"}</Text>
                                        </View>
                                        <View style={styles.progressTrack}>
                                            <View style={[styles.progressFill, { width: `${Math.min(isFinite(progress) ? progress : 0, 100)}%`, backgroundColor: goal.color || colors.primary }]} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.quoteCard}>
                    <Text style={styles.quoteText}>"Bài tập tệ nhất là bài tập bạn không làm."</Text>
                    <Text style={styles.quoteSub}>Giữ động lực nhé!</Text>
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 124,
        gap: 16,
    },
    hero: {
        borderRadius: 28,
        backgroundColor: colors.primary,
        padding: 20,
    },
    heroTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    heroLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.82)",
    },
    heroValue: {
        marginTop: 6,
        fontSize: 34,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    circularProgress: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    circularTrack: {
        position: "absolute",
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 4,
        borderColor: "rgba(255,255,255,0.24)",
    },
    circularCenter: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    heroCopy: {
        fontSize: 13,
        color: "rgba(255,255,255,0.82)",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.42)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.foreground,
        marginBottom: 14,
    },
    modalFields: {
        gap: 12,
    },
    unitRow: {
        flexDirection: "row",
        gap: 8,
    },
    unitPill: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: colors.mutedSoft,
        alignItems: "center",
    },
    unitPillActive: {
        backgroundColor: colors.primarySoft,
    },
    unitText: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.foreground,
    },
    unitTextActive: {
        color: colors.primary,
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
    },
    actionButtonPrimary: {
        flex: 1,
    },
    goalList: {
        gap: 12,
    },
    goalCard: {
        borderRadius: 22,
        backgroundColor: colors.card,
        padding: 16,
        ...shadow,
    },
    goalRow: {
        flexDirection: "row",
        gap: 14,
    },
    goalIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    goalBody: {
        flex: 1,
    },
    goalTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    goalTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.foreground,
    },
    checkBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    goalTarget: {
        marginTop: 4,
        marginBottom: 10,
        fontSize: 13,
        color: colors.muted,
    },
    progressMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    progressMetaText: {
        fontSize: 11,
        color: colors.muted,
    },
    progressDone: {
        color: colors.primary,
        fontWeight: "700",
    },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: "#E2E8F0",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
    },
    quoteCard: {
        borderRadius: 22,
        backgroundColor: colors.mutedSoft,
        padding: 18,
        alignItems: "center",
    },
    quoteText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
        textAlign: "center",
    },
    quoteSub: {
        marginTop: 8,
        fontSize: 12,
        color: colors.muted,
    },
});