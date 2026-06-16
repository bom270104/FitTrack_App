import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme";

const GOALS = [
    {
        id: "loss",
        icon: "trending-down",
        label: "Giảm cân",
        color: colors.accent,
        speeds: [
            { value: 250, label: "0.25 kg/tuần", kcal: "250 kcal" },
            { value: 500, label: "0.5 kg/tuần", kcal: "500 kcal" },
            { value: 825, label: "0.75 kg/tuần", kcal: "825 kcal" },
            { value: 1000, label: "1 kg/tuần", kcal: "1000 kcal" },
        ],
    },
    {
        id: "maintain",
        icon: "equal",
        label: "Giữ cân",
        color: colors.primary,
        speeds: [],
    },
    {
        id: "gain",
        icon: "trending-up",
        label: "Tăng cân",
        color: colors.secondary,
        speeds: [
            { value: 250, label: "0.25 kg/tuần", kcal: "+250 kcal" },
            { value: 500, label: "0.5 kg/tuần", kcal: "+500 kcal" },
            { value: 825, label: "0.75 kg/tuần", kcal: "+825 kcal" },
            { value: 1000, label: "1 kg/tuần", kcal: "+1000 kcal" },
        ],
    },
];

type GoalStepProps = {
    onComplete: (data: { goal: string; deficit_or_surplus: number }) => void;
    onBack: () => void;
};

export function GoalStep({ onComplete, onBack }: GoalStepProps) {
    const [selectedGoal, setSelectedGoal] = useState("maintain");
    const [selectedSpeed, setSelectedSpeed] = useState(500);

    const currentGoal = GOALS.find((g) => g.id === selectedGoal) ?? GOALS[1];
    const hasSpeed = currentGoal.speeds.length > 0;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Mục tiêu của bạn</Text>
            <Text style={styles.subtitle}>Lựa chọn mục tiêu hình thể</Text>

            <View style={styles.goalsContainer}>
                {GOALS.map((goal) => (
                    <View key={goal.id}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.goalCard,
                                selectedGoal === goal.id && styles.goalCardSelected,
                                pressed && styles.goalCardPressed,
                            ]}
                            onPress={() => {
                                setSelectedGoal(goal.id);
                                if (goal.id === "maintain") setSelectedSpeed(0);
                                else setSelectedSpeed(500);
                            }}
                        >
                            <View style={styles.goalHeader}>
                                <MaterialCommunityIcons
                                    name={goal.icon as any}
                                    size={24}
                                    color={goal.color}
                                />
                                <Text style={[styles.goalLabel, { color: goal.color }]}>{goal.label}</Text>
                                {selectedGoal === goal.id && (
                                    <View style={[styles.goalCheck, { backgroundColor: goal.color }]}>
                                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                                    </View>
                                )}
                            </View>

                            {goal.speeds.length === 0 && (
                                <Text style={styles.goalDesc}>Không thay đổi cân nặng</Text>
                            )}
                        </Pressable>

                        {hasSpeed && selectedGoal === goal.id && (
                            <View style={styles.speedsContainer}>
                                {goal.speeds.map((speed) => (
                                    <Pressable
                                        key={speed.value}
                                        style={({ pressed }) => [
                                            styles.speedCard,
                                            selectedSpeed === speed.value && styles.speedCardSelected,
                                            pressed && styles.speedCardPressed,
                                        ]}
                                        onPress={() => setSelectedSpeed(speed.value)}
                                    >
                                        <View style={styles.speedRadio}>
                                            {selectedSpeed === speed.value && (
                                                <View style={styles.speedRadioFill} />
                                            )}
                                        </View>
                                        <Text style={styles.speedLabel}>{speed.label}</Text>
                                        <Text style={styles.speedKcal}>({speed.kcal})</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <View style={styles.buttonGroup}>
                <Pressable
                    style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonPressed]}
                    onPress={onBack}
                >
                    <MaterialCommunityIcons name="chevron-left" size={20} color={colors.primary} />
                    <Text style={styles.buttonSecondaryText}>Quay lại</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    onPress={() => onComplete({ goal: selectedGoal, deficit_or_surplus: selectedSpeed })}
                >
                    <Text style={styles.buttonText}>Hoàn thành</Text>
                    <MaterialCommunityIcons name="check" size={20} color="#fff" />
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.muted,
        marginBottom: 24,
    },
    goalsContainer: {
        gap: 16,
        marginBottom: 32,
    },
    goalCard: {
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.border,
        padding: 16,
    },
    goalCardSelected: {
        borderColor: colors.primary,
    },
    goalCardPressed: {
        opacity: 0.85,
    },
    goalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    goalLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
    },
    goalCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    goalDesc: {
        marginTop: 8,
        fontSize: 13,
        color: colors.muted,
        fontStyle: "italic",
    },
    speedsContainer: {
        marginTop: 12,
        marginLeft: 36,
        gap: 10,
    },
    speedCard: {
        borderRadius: 12,
        backgroundColor: `${colors.primary}08`,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    speedCardSelected: {
        backgroundColor: `${colors.primary}15`,
        borderColor: colors.primary,
    },
    speedCardPressed: {
        opacity: 0.85,
    },
    speedRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    speedRadioFill: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    speedLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: colors.foreground,
    },
    speedKcal: {
        fontSize: 12,
        color: colors.muted,
    },
    buttonGroup: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 40,
    },
    buttonSecondary: {
        flex: 1,
        flexDirection: "row",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    buttonSecondaryText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.primary,
    },
    button: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});
