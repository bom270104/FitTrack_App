import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, shadow } from "../theme";

const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
];

const activityOptions = [
    { label: "Ít vận động", value: "sedentary" },
    { label: "Vận động nhẹ", value: "light" },
    { label: "Vận động vừa", value: "moderate" },
    { label: "Vận động nhiều", value: "active" },
    { label: "Rất năng động", value: "very_active" },
];

const goalOptions = [
    { label: "Tăng cân", value: "gain", delta: 300 },
    { label: "Giảm cân", value: "lose", delta: -300 },
    { label: "Giữ cân", value: "maintain", delta: 0 },
];

export function CaloriesScreen() {
    const { userData, healthData, setScreen, refreshHealth, authFetch, updateCaloriesResult } = useApp();
    const [height, setHeight] = useState(String(userData?.height ?? ""));
    const [weight, setWeight] = useState(String(userData?.weight ?? ""));
    const [age, setAge] = useState(String(userData?.age ?? ""));
    const [gender, setGender] = useState(userData?.gender ?? "male");
    const [activityLevel, setActivityLevel] = useState(userData?.activityLevel ?? "moderate");
    const [goal, setGoal] = useState(userData?.goal ?? "maintain");
    const [result, setResult] = useState<{ bmr: number; tdee: number; recommendedCalories: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedGoal = useMemo(() => goalOptions.find((item) => item.value === goal) ?? goalOptions[2], [goal]);

    const calculateCalories = async () => {
        setError(null);
        setLoading(true);

        try {
            const res = await authFetch("/api/calories/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weight: Number(weight),
                    height: Number(height),
                    age: Number(age),
                    gender,
                    activityLevel,
                    goal,
                }),
            });

            if (!res) {
                setError("Không thể kết nối máy chủ");
                return;
            }

            const body = (await res.json()) as any;

            if (!res.ok) {
                setError(body.message || "Unable to calculate calories");
                return;
            }

            const nextResult = {
                bmr: body.data?.bmr ?? 0,
                tdee: body.data?.tdee ?? 0,
                recommendedCalories: body.data?.recommendedCalories ?? 0,
            };

            setResult(nextResult);
            updateCaloriesResult({
                tdee: nextResult.tdee,
                calorieGoal: nextResult.recommendedCalories,
                bmr: nextResult.bmr,
            });
            await refreshHealth();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            setError("Network error");
            Toast.show({ type: "error", text1: "Thông báo", text2: "Không thể tính TDEE lúc này" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={() => setScreen("dashboard")} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>TDEE Calculator</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <LinearHero tdee={healthData.tdee} goalLabel={selectedGoal.label} calorieGoal={healthData.calorieGoal} />

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Nhập dữ liệu</Text>
                    <View style={styles.grid}>
                        <Field label="Chiều cao (cm)"><Input value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.input} /></Field>
                        <Field label="Cân nặng (kg)"><Input value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} /></Field>
                        <Field label="Tuổi"><Input value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} /></Field>
                    </View>

                    <OptionGroup label="Giới tính" items={genderOptions} selected={gender} onChange={setGender} />
                    <OptionGroup label="Mức độ hoạt động" items={activityOptions} selected={activityLevel} onChange={setActivityLevel} />
                    <OptionGroup label="Mục tiêu" items={goalOptions} selected={goal} onChange={setGoal} />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <Button onPress={calculateCalories} disabled={loading} title={loading ? "Đang tính..." : "Tính TDEE"} style={styles.primaryButton} />
                </View>

                {result ? (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Kết quả</Text>
                        <View style={styles.resultRow}>
                            <ResultTile label="BMR" value={String(result.bmr)} />
                            <ResultTile label="TDEE" value={String(result.tdee)} />
                            <ResultTile label="Calo mục tiêu" value={String(result.recommendedCalories)} />
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            <BottomNav />
        </View>
    );
}

function LinearHero({ tdee, goalLabel, calorieGoal }: { tdee: number; goalLabel: string; calorieGoal: number }) {
    return (
        <View style={styles.hero}>
            <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                    <MaterialCommunityIcons name="calculator-variant" size={26} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.heroCopy}>Calories based on your body and goal</Text>
                    <Text style={styles.heroValue}>{tdee} kcal/day</Text>
                </View>
            </View>
            <Text style={styles.heroFooter}>Goal: {goalLabel} • Recommended: {calorieGoal} kcal/day</Text>
        </View>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {children}
        </View>
    );
}

function OptionGroup<T extends { label: string; value: string }>({ label, items, selected, onChange }: { label: string; items: T[]; selected: string; onChange: (value: string) => void }) {
    return (
        <View style={styles.optionGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.optionWrap}>
                {items.map((item) => {
                    const active = item.value === selected;
                    return (
                        <Pressable key={item.value} onPress={() => onChange(item.value)} style={[styles.optionPill, active && styles.optionPillActive]}>
                            <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

function ResultTile({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.resultTile}>
            <Text style={styles.resultLabel}>{label}</Text>
            <Text style={styles.resultValue}>{value}</Text>
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
    hero: {
        borderRadius: 28,
        backgroundColor: colors.primary,
        padding: 20,
    },
    heroTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    heroIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    heroCopy: {
        fontSize: 13,
        color: "rgba(255,255,255,0.82)",
    },
    heroValue: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    heroFooter: {
        marginTop: 16,
        fontSize: 13,
        color: "rgba(255,255,255,0.84)",
    },
    card: {
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    sectionTitle: {
        marginBottom: 14,
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
    },
    grid: {
        gap: 12,
    },
    field: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.muted,
    },
    input: {
        backgroundColor: colors.mutedSoft,
        fontSize: 16,
    },
    optionGroup: {
        marginTop: 14,
        gap: 8,
    },
    optionWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    optionPill: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: colors.mutedSoft,
    },
    optionPillActive: {
        backgroundColor: colors.primarySoft,
    },
    optionText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.foreground,
    },
    optionTextActive: {
        color: colors.primary,
    },
    error: {
        marginTop: 8,
        fontSize: 13,
        color: colors.destructive,
    },
    primaryButton: {
        marginTop: 16,
        backgroundColor: colors.primary,
    },
    resultRow: {
        flexDirection: "row",
        gap: 10,
    },
    resultTile: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: colors.mutedSoft,
        padding: 14,
    },
    resultLabel: {
        fontSize: 12,
        color: colors.muted,
    },
    resultValue: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "800",
        color: colors.foreground,
    },
});
