import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme";

type GenderStepProps = {
    onNext: (data: { gender: "male" | "female" }) => void;
};

export function GenderStep({ onNext }: GenderStepProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bạn là</Text>
            <Text style={styles.subtitle}>Chọn giới tính của bạn</Text>

            <View style={styles.grid}>
                <Pressable
                    style={({ pressed }) => [styles.box, pressed && styles.boxPressed]}
                    onPress={() => onNext({ gender: "male" })}
                >
                    <MaterialCommunityIcons name="human-male" size={56} color={colors.primary} />
                    <Text style={styles.boxLabel}>Nam</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.box, pressed && styles.boxPressed]}
                    onPress={() => onNext({ gender: "female" })}
                >
                    <MaterialCommunityIcons name="human-female" size={56} color={colors.secondary} />
                    <Text style={styles.boxLabel}>Nữ</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
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
    grid: {
        flexDirection: "row",
        gap: 16,
    },
    box: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 20,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderWidth: 2,
        borderColor: "transparent",
    },
    boxPressed: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}10`,
    },
    boxLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.foreground,
    },
});
