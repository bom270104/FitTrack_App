import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "./app-context";
import { SplashScreen } from "./screens/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { BMIScreen } from "./screens/BMIScreen";
import { CaloriesScreen } from "./screens/CaloriesScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { WaterTrackerScreen } from "./screens/WaterTrackerScreen";
import { StatisticsScreen } from "./screens/StatisticsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { GoalsScreen } from "./screens/GoalsScreen";

export default function Page() {
    const { screen } = useApp();

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={["#F8FAFC", "#EEFDF8", "#F8FAFC"]} style={styles.background}>
                <View style={styles.shell}>
                    {screen === "splash" && <SplashScreen />}
                    {screen === "login" && <LoginScreen />}
                    {screen === "register" && <RegisterScreen />}
                    {screen === "dashboard" && <DashboardScreen />}
                    {screen === "bmi" && <BMIScreen />}
                    {screen === "calories" && <CaloriesScreen />}
                    {screen === "water" && <WaterTrackerScreen />}
                    {screen === "statistics" && <StatisticsScreen />}
                    {screen === "profile" && <ProfileScreen />}
                    {screen === "goals" && <GoalsScreen />}
                    {screen === "onboarding" && <OnboardingScreen />}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    background: {
        flex: 1,
    },
    shell: {
        flex: 1,
        maxWidth: 430,
        width: "100%",
        alignSelf: "center",
        overflow: "hidden",
    },
});