import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme";

type ProgressBarProps = {
    percentage: number;
};

export function ProgressBar({ percentage }: ProgressBarProps) {
    return (
        <View style={styles.container}>
            <View style={styles.background}>
                <View style={[styles.fill, { width: `${percentage}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    background: {
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
});
