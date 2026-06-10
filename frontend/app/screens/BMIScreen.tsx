import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, shadow } from "../theme";

const bmiCategories = [
    { range: "< 18.5", label: "Gầy", color: colors.secondary },
    { range: "18.5 - 24.9", label: "Bình thường", color: colors.primary },
    { range: "25 - 29.9", label: "Thừa cân", color: colors.accent },
    { range: "> 30", label: "Béo phì", color: colors.destructive },
];

function getBMICategory(bmi: number) {
    if (bmi <= 0) return { label: "Chưa có dữ liệu", color: colors.muted };
    if (bmi < 18.5) return { label: "Gầy", color: colors.secondary };
    if (bmi < 25) return { label: "Bình thường", color: colors.primary };
    if (bmi < 30) return { label: "Thừa cân", color: colors.accent };
    return { label: "Béo phì", color: colors.destructive };
}

export function BMIScreen() {
    const { userData, healthData, setScreen, updateWeight, postBmi } = useApp();
    const [height, setHeight] = useState(String(userData?.height ?? ""));
    const [weight, setWeight] = useState(String(healthData.currentWeight ?? ""));
    const initialBmi = typeof (healthData as any).bmi === "number" ? (healthData as any).bmi : (healthData as any).bmi?.latest?.bmi ?? 0;
    const [calculatedBMI, setCalculatedBMI] = useState<number>(initialBmi);

    const category = getBMICategory(calculatedBMI);
    const indicatorPosition = Math.min(Math.max(((calculatedBMI - 15) / 25) * 100, 0), 100);

    const calculateBMI = async () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);

        if (h > 0 && w > 0) {
            const bmi = parseFloat((w / (h * h)).toFixed(1));
            setCalculatedBMI(bmi);
            updateWeight(w);
            try {
                await postBmi({ height: parseFloat(height), weight: w, bmi });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                Alert.alert("Thông báo", "Không thể lưu kết quả BMI");
            }
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={() => setScreen("dashboard")} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Máy tính BMI</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <LinearHero bmi={calculatedBMI} category={category.label} indicatorPosition={indicatorPosition} />

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Tính BMI</Text>
                    <View style={styles.field}>
                        <Text style={styles.label}>Chiều cao (cm)</Text>
                        <Input value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="175" style={styles.input} inputStyle={styles.inputText} />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Cân nặng (kg)</Text>
                        <Input value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="70" style={styles.input} inputStyle={styles.inputText} />
                    </View>
                    <Button onPress={calculateBMI} title="Tính BMI" style={styles.primaryButton} />
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="information-outline" size={18} color={colors.muted} />
                        <Text style={styles.sectionTitle}>Phân loại BMI</Text>
                    </View>
                    <View style={styles.categoryList}>
                        {bmiCategories.map((item) => (
                            <View key={item.label} style={styles.categoryRow}>
                                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                                <Text style={styles.categoryLabel}>{item.label}</Text>
                                <Text style={styles.categoryRange}>{item.range}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    );
}

function LinearHero({ bmi, category, indicatorPosition }: { bmi: number; category: string; indicatorPosition: number }) {
    return (
        <View style={styles.heroOuter}>
            <View style={styles.hero}>
                <Text style={styles.heroLabel}>BMI của bạn</Text>
                <Text style={styles.heroValue}>{bmi > 0 ? bmi.toFixed(1) : "-"}</Text>
                <Text style={styles.heroCategory}>{category}</Text>

                <View style={styles.scaleTrack}>
                    <View style={[styles.scaleSegment, { backgroundColor: colors.secondary }]} />
                    <View style={[styles.scaleSegment, { backgroundColor: colors.primary }]} />
                    <View style={[styles.scaleSegment, { backgroundColor: colors.accent }]} />
                    <View style={[styles.scaleSegment, { backgroundColor: colors.destructive }]} />
                </View>
                <View style={[styles.indicator, { left: `${indicatorPosition}%` }]} />
                <View style={styles.scaleLabels}>
                    <Text style={styles.scaleLabel}>15</Text>
                    <Text style={styles.scaleLabel}>18.5</Text>
                    <Text style={styles.scaleLabel}>25</Text>
                    <Text style={styles.scaleLabel}>30</Text>
                    <Text style={styles.scaleLabel}>40</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.mutedSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.foreground,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 124,
        gap: 16,
    },
    heroOuter: {
        borderRadius: 28,
        overflow: "hidden",
    },
    hero: {
        borderRadius: 28,
        padding: 20,
        backgroundColor: colors.primary,
    },
    heroLabel: {
        textAlign: "center",
        fontSize: 13,
        color: "rgba(255,255,255,0.82)",
    },
    heroValue: {
        marginTop: 8,
        textAlign: "center",
        fontSize: 56,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    heroCategory: {
        marginTop: 6,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    scaleTrack: {
        marginTop: 22,
        flexDirection: "row",
        height: 12,
        borderRadius: 999,
        overflow: "hidden",
    },
    scaleSegment: {
        flex: 1,
    },
    indicator: {
        position: "absolute",
        top: 147,
        width: 18,
        height: 18,
        marginLeft: -9,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: colors.foreground,
        backgroundColor: "#FFFFFF",
    },
    scaleLabels: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    scaleLabel: {
        fontSize: 10,
        color: "rgba(255,255,255,0.72)",
    },
    card: {
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    field: {
        gap: 8,
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.muted,
    },
    input: {
        backgroundColor: colors.mutedSoft,
    },
    inputText: {
        fontSize: 18,
        fontWeight: "700",
    },
    primaryButton: {
        marginTop: 2,
        backgroundColor: colors.primary,
    },
    categoryList: {
        gap: 12,
    },
    categoryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    categoryLabel: {
        flex: 1,
        fontSize: 14,
        color: colors.foreground,
    },
    categoryRange: {
        fontSize: 12,
        color: colors.muted,
    },
});
