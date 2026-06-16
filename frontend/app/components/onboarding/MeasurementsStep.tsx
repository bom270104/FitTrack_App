import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme";

type MeasurementsStepProps = {
    onNext: (data: { height_cm: number; weight_kg: number; target_weight_kg?: number }) => void;
    formData: { height_cm?: number; weight_kg?: number; target_weight_kg?: number };
};

export function MeasurementsStep({ onNext, formData }: MeasurementsStepProps) {
    const [height, setHeight] = React.useState(formData.height_cm || 175);
    const [weight, setWeight] = React.useState(formData.weight_kg || 70);
    const [targetWeight, setTargetWeight] = React.useState(formData.target_weight_kg || 70);

    const bmi = useMemo(() => {
        const heightM = height / 100;
        return Math.round((weight / (heightM * heightM)) * 10) / 10;
    }, [height, weight]);

    const getBmiStatus = (bmi: number) => {
        if (bmi < 18.5) return { label: "Gầy", color: colors.secondary };
        if (bmi < 25) return { label: "Bình thường ✓", color: colors.primary };
        if (bmi < 30) return { label: "Thừa cân", color: colors.accent };
        return { label: "Béo", color: colors.destructive };
    };

    const bmiStatus = getBmiStatus(bmi);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chiều cao & Cân nặng</Text>
            <Text style={styles.subtitle}>Để tính toán mục tiêu calo</Text>

            {/* Height */}
            <View style={styles.sliderSection}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Chiều cao</Text>
                    <Text style={styles.value}>{height} cm</Text>
                </View>
                <View style={styles.controlRow}>
                    <Pressable style={styles.controlButton} onPress={() => setHeight((prev) => Math.max(140, prev - 1))}>
                        <Text style={styles.controlText}>-</Text>
                    </Pressable>
                    <Text style={styles.controlValue}>{height} cm</Text>
                    <Pressable style={styles.controlButton} onPress={() => setHeight((prev) => Math.min(220, prev + 1))}>
                        <Text style={styles.controlText}>+</Text>
                    </Pressable>
                </View>
            </View>

            {/* Weight */}
            <View style={styles.sliderSection}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Cân nặng</Text>
                    <Text style={styles.value}>{weight} kg</Text>
                </View>
                <View style={styles.controlRow}>
                    <Pressable style={styles.controlButton} onPress={() => setWeight((prev) => Math.max(30, Number((prev - 0.5).toFixed(1))))}>
                        <Text style={styles.controlText}>-</Text>
                    </Pressable>
                    <Text style={styles.controlValue}>{weight} kg</Text>
                    <Pressable style={styles.controlButton} onPress={() => setWeight((prev) => Math.min(200, Number((prev + 0.5).toFixed(1))))}>
                        <Text style={styles.controlText}>+</Text>
                    </Pressable>
                </View>
            </View>

            {/* Target Weight */}
            <View style={styles.sliderSection}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Cân nặng mục tiêu</Text>
                    <Text style={styles.value}>{targetWeight} kg</Text>
                </View>
                <View style={styles.controlRow}>
                    <Pressable style={styles.controlButton} onPress={() => setTargetWeight((prev) => Math.max(30, Number((prev - 0.5).toFixed(1))))}>
                        <Text style={styles.controlText}>-</Text>
                    </Pressable>
                    <Text style={styles.controlValue}>{targetWeight} kg</Text>
                    <Pressable style={styles.controlButton} onPress={() => setTargetWeight((prev) => Math.min(200, Number((prev + 0.5).toFixed(1))))}>
                        <Text style={styles.controlText}>+</Text>
                    </Pressable>
                </View>
            </View>

            {/* BMI Demo */}
            <View style={styles.bmiBox}>
                <View style={styles.bmiHeader}>
                    <MaterialCommunityIcons name="target" size={24} color={bmiStatus.color} />
                    <Text style={styles.bmiTitle}>BMI Demo (Real-time)</Text>
                </View>
                <View style={styles.bmiContent}>
                    <Text style={[styles.bmiValue, { color: bmiStatus.color }]}>{bmi}</Text>
                    <Text style={[styles.bmiStatus, { color: bmiStatus.color }]}>{bmiStatus.label}</Text>
                </View>
            </View>

            <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={() => onNext({ height_cm: height, weight_kg: weight, target_weight_kg: targetWeight })}
            >
                <Text style={styles.buttonText}>Tiếp tục</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
            </Pressable>
        </View>
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
        marginBottom: 32,
    },
    sliderSection: {
        marginBottom: 28,
    },
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.foreground,
    },
    value: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.primary,
    },
    controlRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        gap: 12,
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    controlButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    controlText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "800",
    },
    controlValue: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.foreground,
    },
    slider: {
        height: 40,
        borderRadius: 12,
    },
    bmiBox: {
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 32,
    },
    bmiHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    bmiTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.muted,
    },
    bmiContent: {
        alignItems: "center",
        gap: 4,
    },
    bmiValue: {
        fontSize: 32,
        fontWeight: "800",
    },
    bmiStatus: {
        fontSize: 14,
        fontWeight: "600",
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
