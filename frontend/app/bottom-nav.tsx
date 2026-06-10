import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp, type ScreenName } from "./app-context";

const items: Array<{ key: ScreenName; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
    { key: "dashboard", label: "Trang chủ", icon: "home-variant-outline" },
    { key: "bmi", label: "BMI", icon: "scale-balance" },
    { key: "water", label: "Nước", icon: "water-outline" },
    { key: "statistics", label: "Thống kê", icon: "chart-line" },
    { key: "profile", label: "Hồ sơ", icon: "account-outline" },
];

export function BottomNav() {
    const { screen, setScreen } = useApp();

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {items.map((item) => {
                    const active = screen === item.key;

                    return (
                        <Pressable key={item.key} onPress={() => setScreen(item.key)} style={({ pressed }) => [styles.item, active && styles.activeItem, pressed && styles.pressed]}>
                            <MaterialCommunityIcons name={item.icon} size={22} color={active ? "#0F766E" : "#64748B"} />
                            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 8,
        backgroundColor: "rgba(255,255,255,0.95)",
        borderTopWidth: 1,
        borderTopColor: "rgba(148,163,184,0.18)",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 6,
    },
    item: {
        flex: 1,
        minHeight: 54,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 8,
    },
    activeItem: {
        backgroundColor: "rgba(15, 118, 110, 0.10)",
    },
    pressed: {
        opacity: 0.9,
    },
    label: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
    },
    activeLabel: {
        color: "#0F766E",
    },
});