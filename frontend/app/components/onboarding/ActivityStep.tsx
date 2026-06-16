import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme";

const ACTIVITY_LEVELS = [
    { value: 1.2, label: "Ít vận động", icon: "sofa", desc: "Hoạt động tối thiểu" },
    { value: 1.375, label: "Vận động nhẹ", icon: "walk", desc: "1-3 ngày/tuần" },
    { value: 1.55, label: "Vận động vừa", icon: "run", desc: "3-5 ngày/tuần" },
    { value: 1.725, label: "Vận động nặng", icon: "dumbbell", desc: "6-7 ngày/tuần" },
];

type ActivityStepProps = {
    onNext: (data: { activity_level: number }) => void;
};

export function ActivityStep({ onNext }: ActivityStepProps) {
    const [selected, setSelected] = React.useState(1.55);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tần suất vận động</Text>
            <Text style={styles.subtitle}>Hãy chọn mức độ vận động hàng tuần</Text>

            <View style={styles.grid}>
                {ACTIVITY_LEVELS.map((level) => (
                    <Pressable
                        key={level.value}
                        style={({ pressed }) => [
                            styles.card,
                            selected === level.value && styles.cardSelected,
                            pressed && styles.cardPressed,
                        ]}
                        onPress={() => setSelected(level.value)}
                    >
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons
                                name={level.icon as any}
                                size={28}
                                color={selected === level.value ? colors.primary : colors.muted}
                            />
                            {selected === level.value && (
                                <View style={styles.checkmark}>
                                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                                </View>
                            )}
                        </View>
                        <Text style={[styles.cardLabel, selected === level.value && styles.cardLabelSelected]}>
                            {level.label}
                        </Text>
                        <Text style={styles.cardDesc}>{level.desc}</Text>
                        <Text style={[styles.cardPal, selected === level.value && styles.cardPalSelected]}>
                            PAL: {level.value}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={() => onNext({ activity_level: selected })}
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
        marginBottom: 24,
    },
    grid: {
        flexDirection: "column",
        gap: 12,
        marginBottom: 32,
    },
    card: {
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.border,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    cardSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}10`,
    },
    cardPressed: {
        opacity: 0.85,
    },
    cardHeader: {
        position: "relative",
    },
    checkmark: {
        position: "absolute",
        bottom: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    cardLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: colors.foreground,
    },
    cardLabelSelected: {
        color: colors.primary,
    },
    cardDesc: {
        position: "absolute",
        right: 16,
        top: 50,
        fontSize: 12,
        color: colors.muted,
    },
    cardPal: {
        position: "absolute",
        right: 16,
        bottom: 16,
        fontSize: 12,
        fontWeight: "600",
        color: colors.muted,
    },
    cardPalSelected: {
        color: colors.primary,
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
