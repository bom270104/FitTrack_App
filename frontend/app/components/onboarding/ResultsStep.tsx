import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme";

type ResultsStepProps = {
    results: {
        calorieGoal: number;
        proteinG: number;
        carbsG: number;
        fatG: number;
    };
    formData: Record<string, unknown>;
    onStartTracking: () => void;
};

export function ResultsStep({ results, formData, onStartTracking }: ResultsStepProps) {
    return (
        <View style={styles.container}>
            <View style={styles.celebration}>
                <MaterialCommunityIcons name="party-popper" size={56} color={colors.primary} />
                <Text style={styles.celebrationText}>Chúc mừng!</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.resultTitle}>Mục tiêu calo hằng ngày của bạn</Text>

                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.calorieBox}>
                    <Text style={styles.calorieValue}>{results.calorieGoal}</Text>
                    <Text style={styles.calorieUnit}>kcal/ngày</Text>
                </LinearGradient>

                <View style={styles.macrosSection}>
                    <Text style={styles.macrosTitle}>Phân bổ Macronutrients</Text>

                    <View style={styles.macrosGrid}>
                        <View style={[styles.macroCard, { borderLeftColor: "#FF6B6B" }]}>
                            <Text style={styles.macroIcon}>🥚</Text>
                            <Text style={styles.macroLabel}>Protein</Text>
                            <Text style={styles.macroValue}>{results.proteinG}g</Text>
                            <Text style={styles.macroPercent}>40%</Text>
                        </View>

                        <View style={[styles.macroCard, { borderLeftColor: "#FFA500" }]}>
                            <Text style={styles.macroIcon}>🌾</Text>
                            <Text style={styles.macroLabel}>Carbs</Text>
                            <Text style={styles.macroValue}>{results.carbsG}g</Text>
                            <Text style={styles.macroPercent}>40%</Text>
                        </View>

                        <View style={[styles.macroCard, { borderLeftColor: "#4CAF50" }]}>
                            <Text style={styles.macroIcon}>🥑</Text>
                            <Text style={styles.macroLabel}>Fat</Text>
                            <Text style={styles.macroValue}>{results.fatG}g</Text>
                            <Text style={styles.macroPercent}>20%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tipBox}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.accent} />
                    <Text style={styles.tipText}>
                        Hãy bắt đầu ghi nhật ký bữa ăn để theo dõi tiến độ của bạn
                    </Text>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    onPress={onStartTracking}
                >
                    <Text style={styles.buttonText}>Bắt đầu theo dõi ngay</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    celebration: {
        alignItems: "center",
        marginBottom: 32,
    },
    celebrationText: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.primary,
        marginTop: 8,
    },
    content: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.foreground,
        marginBottom: 16,
    },
    calorieBox: {
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
    },
    calorieValue: {
        fontSize: 48,
        fontWeight: "800",
        color: "#fff",
    },
    calorieUnit: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    macrosSection: {
        marginBottom: 24,
    },
    macrosTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.foreground,
        marginBottom: 12,
    },
    macrosGrid: {
        flexDirection: "row",
        gap: 12,
    },
    macroCard: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: colors.card,
        borderLeftWidth: 4,
        padding: 12,
        alignItems: "center",
    },
    macroIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    macroLabel: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 4,
    },
    macroValue: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.foreground,
    },
    macroPercent: {
        fontSize: 11,
        color: colors.muted,
        marginTop: 2,
    },
    tipBox: {
        borderRadius: 12,
        backgroundColor: `${colors.accent}15`,
        borderWidth: 1,
        borderColor: `${colors.accent}40`,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 24,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: colors.foreground,
        fontWeight: "500",
    },
    button: {
        flexDirection: "row",
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
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
