import React, { useState, useEffect } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { GenderStep } from "../components/onboarding/GenderStep";
import { AgeStep } from "../components/onboarding/AgeStep";
import { MeasurementsStep } from "../components/onboarding/MeasurementsStep";
import { ActivityStep } from "../components/onboarding/ActivityStep";
import { GoalStep } from "../components/onboarding/GoalStep";
import { ResultsStep } from "../components/onboarding/ResultsStep";
import { ProgressBar } from "../components/onboarding/ProgressBar";
import { useApp } from "../app-context";
import Toast from "react-native-toast-message";
import { colors } from "../theme";

export function OnboardingScreen() {
    const { setScreen, authFetch, refreshProfile, refreshHealth, userData } = useApp();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ calorieGoal: number; proteinG: number; carbsG: number; fatG: number } | null>(null);
    const [formData, setFormData] = useState<{
        gender: string | null;
        age: number;
        height_cm: number;
        weight_kg: number;
        target_weight_kg?: number;
        activity_level: number;
        goal: string;
        deficit_or_surplus: number;
    }>({
        gender: null,
        age: 25,
        height_cm: 175,
        weight_kg: 70,
        target_weight_kg: 70,
        activity_level: 1.55,
        goal: "maintain",
        deficit_or_surplus: 0,
    });

    useEffect(() => {
        async function loadExistingProfile() {
            if (!userData) return;
            try {
                const res = await authFetch("/api/onboarding/profile");
                if (res && res.ok) {
                    const body = await res.json() as any;
                    const profile = body?.data?.profile;
                    if (profile) {
                        setFormData({
                            gender: profile.gender || null,
                            age: Number(profile.age) || 25,
                            height_cm: Number(profile.height_cm) || 175,
                            weight_kg: Number(profile.weight_kg) || 70,
                            target_weight_kg: Number(profile.target_weight_kg) || Number(profile.weight_kg) || 70,
                            activity_level: Number(profile.activity_level) || 1.55,
                            goal: profile.goal || "maintain",
                            deficit_or_surplus: Number(profile.deficit_or_surplus) || 0,
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading onboarding profile:", error);
            }
        }
        void loadExistingProfile();
    }, [authFetch, userData]);

    const handleNextStep = (data: Partial<typeof formData>) => {
        const updated = { ...formData, ...data };
        setFormData(updated);
        setStep(step + 1);
    };

    const handleCompleteOnboarding = async (finalData: Partial<typeof formData>) => {
        try {
            setLoading(true);
            const payload = { ...formData, ...finalData };

            const response = await authFetch("/api/onboarding/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = response ? (await response.json()) as any : null;

            if (response && response.ok && data?.success) {
                // refresh user profile from server so profileComplete is updated
                await refreshProfile();
                await refreshHealth();

                setResults(data.data?.profile ?? {
                    calorieGoal: 0,
                    proteinG: 0,
                    carbsG: 0,
                    fatG: 0,
                });
                setStep(6);
                Toast.show({
                    type: "success",
                    text1: "Thành công!",
                    text2: "Thiết lập chỉ số cơ thể hoàn tất",
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Lỗi",
                    text2: data?.message || "Không thể hoàn thành onboarding",
                });
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            Toast.show({
                type: "error",
                text1: "Lỗi kết nối",
                text2: String(error),
            });
        } finally {
            setLoading(false);
        }
    };

    const progressPercentage = (step - 1) / 6 * 100;

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.topBar}>
                <Pressable
                    onPress={() => {
                        if (step > 1) {
                            setStep((s) => Math.max(1, s - 1));
                        } else {
                            setScreen(userData ? "profile" : "login");
                        }
                    }}
                    style={styles.topBarButton}
                >
                    <Text style={styles.topBarButtonText}>{step > 1 ? "Quay lại" : "Thoát"}</Text>
                </Pressable>
            </View>

            <ProgressBar percentage={progressPercentage} />

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEnabled={true}>
                {step === 1 && <GenderStep onNext={handleNextStep} />}
                {step === 2 && <AgeStep onNext={handleNextStep} initialAge={formData.age} />}
                {step === 3 && <MeasurementsStep onNext={handleNextStep} formData={formData} />}
                {step === 4 && <ActivityStep onNext={handleNextStep} initialActivityLevel={formData.activity_level} />}
                {step === 5 && (
                    <GoalStep
                        onComplete={handleCompleteOnboarding}
                        onBack={() => setStep(step - 1)}
                        initialGoal={formData.goal}
                        initialSpeed={formData.deficit_or_surplus}
                    />
                )}
                {step === 6 && results && (
                    <ResultsStep
                        results={results}
                        formData={formData}
                        onStartTracking={() => setScreen("dashboard")}
                    />
                )}
            </ScrollView>

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    topBar: {
        height: 56,
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    topBarButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    topBarButtonText: {
        color: colors.primary,
        fontWeight: "700",
    },
});
