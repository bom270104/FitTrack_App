"use client";

import { useApp } from "./app-context";
import { SplashScreen } from "./screens/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { BMIScreen } from "./screens/BMIScreen";
import { WaterTrackerScreen } from "./screens/WaterTrackerScreen";
import { StatisticsScreen } from "./screens/StatisticsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { GoalsScreen } from "./screens/GoalsScreen";

export default function Page() {
    const { screen } = useApp();

    return (
        <main className="screen-shell screen-bg-pattern">
            {screen === "splash" && <SplashScreen />}
            {screen === "login" && <LoginScreen />}
            {screen === "register" && <RegisterScreen />}
            {screen === "dashboard" && <DashboardScreen />}
            {screen === "bmi" && <BMIScreen />}
            {screen === "water" && <WaterTrackerScreen />}
            {screen === "statistics" && <StatisticsScreen />}
            {screen === "profile" && <ProfileScreen />}
            {screen === "goals" && <GoalsScreen />}
        </main>
    );
}