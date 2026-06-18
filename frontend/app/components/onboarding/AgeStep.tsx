import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme";

type AgeStepProps = {
    onNext: (data: { age: number }) => void;
    initialAge?: number;
    onBack?: () => void;
};

export function AgeStep({ onNext, initialAge = 25, onBack }: AgeStepProps) {
    const [age, setAge] = useState(initialAge);
    const [birthYearInput, setBirthYearInput] = useState<string>(String(new Date().getFullYear() - initialAge));
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(birthYearInput, 10) || currentYear - age;
    const derivedAge = Math.max(13, Math.min(100, currentYear - birthYear));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tuổi của bạn</Text>
            <Text style={styles.subtitle}>Để tính toán tỷ lệ chuyển hóa chính xác</Text>

            <View style={styles.pickerContainer}>
                <View style={styles.counterRow}>
                    <Pressable
                        style={styles.counterButton}
                        onPress={() => {
                            const newAge = Math.max(13, age - 1);
                            setAge(newAge);
                            setBirthYearInput(String(currentYear - newAge));
                        }}
                    >
                        <Text style={styles.counterButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.counterValue}>{derivedAge}</Text>
                    <Pressable
                        style={styles.counterButton}
                        onPress={() => {
                            const newAge = Math.min(100, age + 1);
                            setAge(newAge);
                            setBirthYearInput(String(currentYear - newAge));
                        }}
                    >
                        <Text style={styles.counterButtonText}>+</Text>
                    </Pressable>
                </View>

                <View style={styles.birthYearRow}>
                    <Text style={styles.birthYearLabel}>Nhập năm sinh (ví dụ: 1990)</Text>
                    <TextInput
                        value={birthYearInput}
                        onChangeText={(t) => {
                            const filtered = t.replace(/[^0-9]/g, "");
                            setBirthYearInput(filtered);
                            const by = parseInt(filtered, 10);
                            if (!isNaN(by)) {
                                const newAge = Math.max(13, Math.min(100, currentYear - by));
                                setAge(newAge);
                            }
                        }}
                        keyboardType="numeric"
                        style={styles.birthYearInput}
                        maxLength={4}
                    />
                </View>
            </View>

            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Năm sinh:</Text>
                    <Text style={styles.infoValue}>{birthYear}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tuổi hiện tại:</Text>
                    <Text style={styles.infoValue}>{age} tuổi</Text>
                </View>
            </View>

            <View style={styles.buttonRow}>
                {onBack ? (
                    <Pressable style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </Pressable>
                ) : null}

                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    onPress={() => onNext({ age: derivedAge })}
                >
                    <Text style={styles.buttonText}>Tiếp tục</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
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
    pickerContainer: {
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
        overflow: "hidden",
    },
    counterRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 14,
    },
    counterButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    counterButtonText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "800",
    },
    counterValue: {
        marginHorizontal: 20,
        fontSize: 24,
        fontWeight: "800",
        color: colors.foreground,
    },
    infoBox: {
        borderRadius: 16,
        backgroundColor: `${colors.primary}15`,
        padding: 16,
        marginBottom: 32,
        gap: 12,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 14,
        color: colors.muted,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "700",
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
    birthYearRow: {
        padding: 12,
    },
    birthYearLabel: {
        fontSize: 14,
        color: colors.muted,
        marginBottom: 8,
    },
    birthYearInput: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.foreground,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    backButton: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: colors.card,
    },
    backButtonText: {
        color: colors.muted,
        fontWeight: "700",
    },
});
