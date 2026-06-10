import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../app-context";
import { colors } from "../theme";

export function SplashScreen() {
    const { setScreen } = useApp();

    useEffect(() => {
        const timer = setTimeout(() => {
            setScreen("login");
        }, 2500);

        return () => clearTimeout(timer);
    }, [setScreen]);

    return (
        <LinearGradient colors={[colors.primary, "#0E8C82", colors.secondary]} style={styles.root}>
            <View style={styles.center}>
                <View style={styles.logoWrap}>
                    <MaterialCommunityIcons name="heart-pulse" size={58} color="#FFFFFF" />
                </View>
                <View style={styles.copy}>
                    <Text style={styles.title}>FitTrack</Text>
                    <Text style={styles.subtitle}>Bạn đồng hành sức khỏe</Text>
                </View>
            </View>

            <View style={styles.dots}>
                <View style={styles.dot} />
                <View style={[styles.dot, styles.dotMid]} />
                <View style={[styles.dot, styles.dotLast]} />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    center: {
        alignItems: "center",
        gap: 22,
    },
    logoWrap: {
        width: 104,
        height: 104,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    copy: {
        alignItems: "center",
    },
    title: {
        fontSize: 40,
        fontWeight: "800",
        letterSpacing: -0.8,
        color: "#FFFFFF",
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "600",
        color: "rgba(255,255,255,0.82)",
    },
    dots: {
        position: "absolute",
        bottom: 96,
        flexDirection: "row",
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.65)",
    },
    dotMid: {
        opacity: 0.8,
    },
    dotLast: {
        opacity: 0.6,
    },
});