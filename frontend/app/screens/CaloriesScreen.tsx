import React, { useMemo, useState, useEffect } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { Button } from "@/components/ui/button";
import { colors, shadow } from "../theme";
import { SearchFoodModal } from "../components/SearchFoodModal";

const mealGroups: Array<{ key: "breakfast" | "lunch" | "dinner" | "snack"; label: string; icon: string }> = [
    { key: "breakfast", label: "Bữa sáng", icon: "coffee" },
    { key: "lunch", label: "Bữa trưa", icon: "silverware-fork-knife" },
    { key: "dinner", label: "Bữa tối", icon: "food-steak" },
    { key: "snack", label: "Bữa phụ", icon: "cookie" },
];

export function CaloriesScreen() {
    const { todayMeals, mealTotals, healthData, searchFoods, logMeal, deleteLoggedFood, setScreen, refreshHealth } = useApp();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
    const [modalLoading, setModalLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
    const [displayCalories, setDisplayCalories] = useState(0);

    const progressPercent = useMemo(() => {
        if (!healthData.calorieGoal || healthData.calorieGoal <= 0) {
            return 0;
        }
        return Math.min(100, Math.round((healthData.dailyCalories / healthData.calorieGoal) * 100));
    }, [healthData.calorieGoal, healthData.dailyCalories]);

    useEffect(() => {
        const targetCalories = healthData.dailyCalories;
        if (displayCalories === targetCalories) return;

        const duration = 800;
        const startTime = Date.now();
        const diff = targetCalories - displayCalories;

        const animationFrame = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            setDisplayCalories(Math.round(displayCalories + diff * progress));

            if (progress >= 1) {
                setDisplayCalories(targetCalories);
                clearInterval(animationFrame);
            }
        }, 16);

        return () => clearInterval(animationFrame);
    }, [healthData.dailyCalories]);

    const selectedMealGroup = todayMeals[selectedMeal];

    const formatNumber = (num: number): string => {
        if (!Number.isFinite(num)) return "0";
        const rounded = Math.round(num * 10) / 10;
        return rounded.toFixed(1).replace(/\.0$/, "");
    };

    const handleOpenSearch = (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
        setSelectedMeal(mealType);
        setModalVisible(true);
    };

    const handleAddFood = async (food: { _id: string; name: string; calories: number; protein: number; carbs: number; fat: number; servingSize: number }, weightGrams: number) => {
        setModalLoading(true);
        const success = await logMeal(selectedMeal, food._id, weightGrams);
        setModalLoading(false);

        if (success) {
            Toast.show({ type: "success", text1: "Đã thêm", text2: `${food.name} vào ${selectedMealGroup.mealType}` });
            setModalVisible(false);
            await refreshHealth();
            return;
        }

        Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể thêm thực phẩm" });
    };

    const handleRemoveFood = async (logId: string | null, foodId: string, name: string) => {
        if (!logId) {
            return;
        }

        Alert.alert("Xóa món ăn", `Bạn có chắc muốn xóa ${name} không?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    setDeleteLoadingId(foodId);
                    const success = await deleteLoggedFood(logId, foodId);
                    setDeleteLoadingId(null);
                    if (success) {
                        Toast.show({ type: "success", text1: "Đã xóa", text2: `${name} đã được xóa` });
                        await refreshHealth();
                    } else {
                        Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể xóa thực phẩm" });
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={() => setScreen("dashboard")} style={styles.headerBack}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color="#F8FAFC" />
                </Pressable>
                <View>
                    <Text style={styles.screenTitle}>Lượng calo & Dinh dưỡng</Text>
                    <Text style={styles.screenSubTitle}>Theo dõi bữa ăn hàng ngày của bạn</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>Mục tiêu calo</Text>
                        <Text style={styles.heroValue}>{displayCalories.toLocaleString()} / {healthData.calorieGoal.toLocaleString()} kcal</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progressPercent}% của mục tiêu</Text>
                    <View style={styles.macroRow}>
                        <MacroTile label="P" consumed={mealTotals.protein} goal={healthData.proteinGoal} color="#3B82F6" formatNumber={formatNumber} />
                        <MacroTile label="C" consumed={mealTotals.carbs} goal={healthData.carbsGoal} color="#F59E0B" formatNumber={formatNumber} />
                        <MacroTile label="F" consumed={mealTotals.fat} goal={healthData.fatGoal} color="#10B981" formatNumber={formatNumber} />
                    </View>
                </View>

                {mealGroups.map((group) => {
                    const meal = todayMeals[group.key];
                    return (
                        <View key={group.key} style={styles.mealCard}>
                            <View style={styles.mealHeader}>
                                <View style={styles.mealLabelRow}>
                                    <View style={styles.mealIconContainer}>
                                        <MaterialCommunityIcons name={group.icon as any} size={18} color="#00C896" />
                                    </View>
                                    <View>
                                        <Text style={styles.mealTitle}>{group.label}</Text>
                                        <Text style={styles.mealSummary}>{formatNumber(meal.totalCalories)} kcal • {formatNumber(meal.protein)}g P • {formatNumber(meal.carbs)}g C • {formatNumber(meal.fat)}g F</Text>
                                    </View>
                                </View>
                                <Button title="Thêm" onPress={() => handleOpenSearch(group.key)} style={styles.addMealButton} />
                            </View>
                            {meal.foods.length === 0 ? (
                                <Text style={styles.emptyMealText}>Chưa có món ăn nào cho bữa này.</Text>
                            ) : (
                                <View style={styles.foodList}>
                                    {meal.foods.map((item) => (
                                        <View key={item.foodId} style={styles.foodItem}>
                                            <View style={styles.foodMain}>
                                                <Text style={styles.foodName}>{item.name}</Text>
                                                <Text style={styles.foodMeta}>{item.weightGrams}g • {item.totalCalories} kcal</Text>
                                            </View>
                                            <Pressable
                                                disabled={deleteLoadingId === item.foodId}
                                                onPress={() => handleRemoveFood(meal.logId, item.foodId, item.name)}
                                                style={styles.deleteButton}
                                            >
                                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F87171" />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            <SearchFoodModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSearch={searchFoods}
                onAdd={handleAddFood}
                loading={modalLoading}
            />
            <BottomNav />
        </View>
    );
}

function MacroTile({ label, consumed, goal, color, formatNumber }: { label: string; consumed: number; goal: number; color: string; formatNumber: (num: number) => string }) {
    return (
        <View style={[styles.macroTile, { borderColor: color }]}>
            <Text style={styles.macroLabel}>{label}</Text>
            <Text style={[styles.macroValue, { color }]}>{formatNumber(consumed)}g {goal > 0 ? `/ ${formatNumber(goal)}g` : ""}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#0F1117",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
        gap: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    headerBack: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    screenTitle: {
        color: "#F8FAFC",
        fontSize: 20,
        fontWeight: "800",
    },
    screenSubTitle: {
        marginTop: 4,
        color: "#94A3B8",
        fontSize: 13,
    },
    heroCard: {
        borderRadius: 28,
        padding: 20,
        backgroundColor: "#1C1E2A",
        ...shadow,
    },
    heroTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    heroTitle: {
        color: "#94A3B8",
        fontSize: 13,
        marginBottom: 8,
    },
    heroValue: {
        color: "#F8FAFC",
        fontSize: 22,
        fontWeight: "800",
    },
    progressTrack: {
        marginTop: 20,
        width: "100%",
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#00C896",
    },
    progressText: {
        marginTop: 10,
        color: "#94A3B8",
        fontSize: 12,
    },
    macroRow: {
        marginTop: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    macroTile: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    macroLabel: {
        color: "#94A3B8",
        fontSize: 12,
        marginBottom: 6,
        fontWeight: "700",
    },
    macroValue: {
        fontSize: 16,
        fontWeight: "800",
    },
    mealCard: {
        borderRadius: 24,
        padding: 18,
        backgroundColor: "#1C1E2A",
        ...shadow,
    },
    mealHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 14,
    },
    mealLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    mealIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: "rgba(0,200,150,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    mealTitle: {
        color: "#F8FAFC",
        fontSize: 16,
        fontWeight: "800",
    },
    mealSummary: {
        color: "#94A3B8",
        fontSize: 9,
        marginTop: 4,
    },
    addMealButton: {
        backgroundColor: "#00C896",
    },
    emptyMealText: {
        color: "#94A3B8",
        fontSize: 13,
    },
    foodList: {
        gap: 12,
    },
    foodItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    foodMain: {
        flex: 1,
    },
    foodName: {
        color: "#F8FAFC",
        fontSize: 15,
        fontWeight: "700",
    },
    foodMeta: {
        marginTop: 4,
        color: "#94A3B8",
        fontSize: 12,
    },
    deleteButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(248,113,113,0.12)",
    },
});
