import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import NotificationSettings from "../components/NotificationSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, shadow } from "../theme";

const menuItems = [
    { icon: "calculator-variant-outline", label: "Tính lại TDEE & Mục tiêu", action: "re-onboard" },
    { icon: "bell-outline", label: "Thông báo", action: "notifications" },
    { icon: "moon-waning-crescent", label: "Giao diện tối", action: "darkmode", toggle: true },
    { icon: "shield-outline", label: "Quyền riêng tư", action: "privacy" },
    { icon: "help-circle-outline", label: "Trợ giúp", action: "help" },
    { icon: "cog-outline", label: "Cài đặt ứng dụng", action: "settings" },
] as const;

export function ProfileScreen() {
    const { userData, healthData, setScreen, updateProfile, logout, authFetch } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [activeInfo, setActiveInfo] = useState<{ title: string; body: string } | null>(null);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [activeGoalCount, setActiveGoalCount] = useState(0);
    const [weeklyProgress, setWeeklyProgress] = useState(0);
    const currentYear = new Date().getFullYear();
    const initialBirthYear = (userData as any)?.date_of_birth
        ? String(new Date((userData as any).date_of_birth).getFullYear())
        : userData?.age
            ? String(currentYear - userData.age)
            : "";

    const [profileForm, setProfileForm] = useState({
        name: userData?.name ?? "",
        birthYear: initialBirthYear,
        height: String(userData?.height ?? ""),
        weight: String(userData?.weight ?? ""),
        dailyWaterGoal: String(userData?.dailyWaterGoal ?? 2000),
    });
    const [profileError, setProfileError] = useState<string | null>(null);

    // Fetch goals to compute live count & progress (mirrors GoalsScreen logic)
    useEffect(() => {
        async function fetchGoalsSummary() {
            try {
                const res = await authFetch("/api/goals");
                if (!res || !res.ok) return;
                const body = (await res.json()) as any;
                const serverGoals: any[] = Array.isArray(body.data?.goals) ? body.data.goals : [];
                if (serverGoals.length === 0) return;

                setActiveGoalCount(serverGoals.length);

                // Compute average progress across goals
                const totalProgress = serverGoals.reduce((sum: number, g: any) => {
                    const maxVal = Number(g.max) > 0 ? Number(g.max) : (Number(String(g.target ?? "").replace(/[^0-9.]/g, "")) || 1);
                    let currentVal = Number(g.current);
                    // Use live healthData for known unit types
                    const unit = g.unit ?? "";
                    if (unit === "ml" && (!currentVal || currentVal <= 0)) currentVal = healthData.waterIntake;
                    if (unit === "kg" && (!currentVal || currentVal <= 0)) currentVal = healthData.currentWeight;
                    const pct = maxVal > 0 ? Math.min(Math.max((currentVal / maxVal) * 100, 0), 100) : 0;
                    return sum + pct;
                }, 0);
                setWeeklyProgress(Math.round(totalProgress / serverGoals.length));
            } catch {
                // noop
            }
        }
        void fetchGoalsSummary();
    }, [authFetch, healthData.waterIntake, healthData.currentWeight]);

    const parseOptionalNumber = (value: string) => {
        const trimmed = value.trim();
        return trimmed ? Number(trimmed) : undefined;
    };

    const openEditProfile = () => {
        const birthYear = (userData as any)?.date_of_birth
            ? String(new Date((userData as any).date_of_birth).getFullYear())
            : userData?.age
                ? String(currentYear - userData.age)
                : "";

        setProfileForm({
            name: userData?.name ?? "",
            birthYear,
            height: String(userData?.height ?? ""),
            weight: String(userData?.weight ?? ""),
            dailyWaterGoal: String(userData?.dailyWaterGoal ?? 2000),
        });
        setProfileError(null);
        setShowEditProfile(true);
    };

    const saveProfile = async () => {
        setProfileError(null);

        const birthYearNum = parseOptionalNumber(profileForm.birthYear ?? "");
        const ageToSend = birthYearNum ? Math.max(0, currentYear - birthYearNum) : undefined;

        const ok = await updateProfile({
            name: profileForm.name,
            age: ageToSend,
            height: parseOptionalNumber(profileForm.height),
            weight: parseOptionalNumber(profileForm.weight),
            dailyWaterGoal: parseOptionalNumber(profileForm.dailyWaterGoal),
        });

        if (!ok) {
            const message = "Không thể cập nhật hồ sơ. Vui lòng thử lại.";
            setProfileError(message);
            Toast.show({ type: "error", text1: "Thông báo", text2: message });
            return;
        }

        Toast.show({ type: "success", text1: "Thông báo", text2: "Đã cập nhật hồ sơ thành công." });
        setShowEditProfile(false);
    };

    const userStats = [
        { icon: "ruler", label: "Chiều cao", value: `${userData?.height ?? "-"} cm` },
        { icon: "weight", label: "Cân nặng", value: `${userData?.weight ?? "-"} kg` },
        { icon: "calendar", label: "Tuổi", value: `${userData?.age ?? "-"} tuổi` },
    ] as const;

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hồ sơ</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.heroRow}>
                        <View style={styles.avatar}>
                            <MaterialCommunityIcons name="account-outline" size={42} color="#FFFFFF" />
                        </View>
                        <View style={styles.heroBody}>
                            <Text style={styles.heroName}>{userData?.name ?? ""}</Text>
                            <Text style={styles.heroEmail}>{userData?.email ?? ""}</Text>
                            <Pressable onPress={openEditProfile} style={styles.editPill}>
                                <Text style={styles.editText}>Chỉnh sửa hồ sơ</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        {userStats.map((stat) => (
                            <View key={stat.label} style={styles.statItem}>
                                <View style={styles.statIcon}><MaterialCommunityIcons name={stat.icon as any} size={20} color={colors.primary} /></View>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Pressable onPress={() => setScreen("goals")} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <View>
                            <Text style={styles.goalTitle}>Mục tiêu của tôi</Text>
                            <Text style={styles.goalSubtitle}>
                                {activeGoalCount > 0 ? `${activeGoalCount} mục tiêu đang hoạt động` : "Chưa có mục tiêu"}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
                    </View>
                </Pressable>

                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <Pressable
                            key={item.action}
                            onPress={() => {
                                if (item.action === "re-onboard") {
                                    setScreen("onboarding");
                                    return;
                                }
                                if (item.action === "notifications") {
                                    setShowNotifications(true);
                                    return;
                                }
                                if (item.action === "privacy") {
                                    setActiveInfo({ title: "Quyền riêng tư", body: "Dữ liệu hồ sơ của bạn được lưu trữ an toàn trên backend của FitTrack. Xác thực bằng token bảo vệ các tuyến riêng tư." });
                                    return;
                                }
                                if (item.action === "help") {
                                    setActiveInfo({ title: "Trợ giúp", body: "Sử dụng Dashboard để tổng quan, BMI để tính chỉ số cơ thể, Water để ghi lại lượng uống và Thống kê để xem xu hướng." });
                                    return;
                                }
                                if (item.action === "settings") {
                                    setActiveInfo({ title: "Cài đặt ứng dụng", body: "Bản demo hiện hỗ trợ hồ sơ, cài đặt thông báo và theo dõi sức khỏe. Chế độ tối được giữ như một tuỳ chọn giao diện cục bộ." });
                                    return;
                                }
                                if (item.action === "darkmode") {
                                    setDarkModeEnabled((current) => !current);
                                }
                            }}
                            style={({ pressed }) => [styles.menuRow, index !== menuItems.length - 1 && styles.menuDivider, pressed && styles.menuPressed]}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIcon}><MaterialCommunityIcons name={item.icon as any} size={18} color={colors.foreground} /></View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            {"toggle" in item && item.toggle ? (
                                <View style={styles.switchTrack}>
                                    <View style={[styles.switchThumb, darkModeEnabled && styles.switchThumbActive]} />
                                </View>
                            ) : (
                                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
                            )}
                        </Pressable>
                    ))}
                </View>

                <Pressable onPress={logout} style={styles.logoutButton}>
                    <MaterialCommunityIcons name="logout" size={18} color={colors.destructive} />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </Pressable>
            </ScrollView>

            {showNotifications ? <NotificationSettings visible={showNotifications} onClose={() => setShowNotifications(false)} /> : null}

            <Modal visible={!!activeInfo} transparent animationType="fade" onRequestClose={() => setActiveInfo(null)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>{activeInfo?.title}</Text>
                        <Text style={styles.infoBody}>{activeInfo?.body}</Text>
                        <View style={styles.infoActions}>
                            <Button onPress={() => setActiveInfo(null)} title="Đóng" style={styles.infoButton} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showEditProfile} transparent animationType="fade" onRequestClose={() => setShowEditProfile(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.editCard}>
                        <Text style={styles.infoTitle}>Chỉnh sửa hồ sơ</Text>
                        <View style={styles.editFields}>
                            <Input value={profileForm.name} onChangeText={(text) => setProfileForm((current) => ({ ...current, name: text }))} placeholder="Họ và tên" />
                            <Text style={styles.helperText}>Email chỉ đọc và theo thông tin đăng ký tài khoản.</Text>
                            <View style={styles.twoCol}>
                                <Input value={profileForm.birthYear} onChangeText={(text) => setProfileForm((current) => ({ ...current, birthYear: text }))} placeholder="Năm sinh" keyboardType="numeric" style={styles.flexInput} />
                                <Input value={profileForm.height} onChangeText={(text) => setProfileForm((current) => ({ ...current, height: text }))} placeholder="Chiều cao (cm)" keyboardType="numeric" style={styles.flexInput} />
                            </View>
                            <Input value={profileForm.weight} onChangeText={(text) => setProfileForm((current) => ({ ...current, weight: text }))} placeholder="Cân nặng (kg)" keyboardType="numeric" />
                            {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
                            <View style={styles.editActions}>
                                <Button variant="outline" onPress={() => setShowEditProfile(false)} title="Hủy" style={styles.actionButton} />
                                <Button onPress={saveProfile} title="Lưu" style={styles.actionButtonPrimary} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
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
    hero: {
        borderRadius: 28,
        backgroundColor: colors.primary,
        padding: 20,
    },
    heroRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    heroBody: {
        flex: 1,
    },
    heroName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    heroEmail: {
        marginTop: 4,
        fontSize: 13,
        color: "rgba(255,255,255,0.82)",
    },
    editPill: {
        alignSelf: "flex-start",
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    editText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statsCard: {
        borderRadius: 22,
        backgroundColor: colors.card,
        padding: 16,
        ...shadow,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 11,
        color: colors.muted,
    },
    statValue: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: "700",
        color: colors.foreground,
    },
    goalCard: {
        borderRadius: 22,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    goalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.foreground,
    },
    goalSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: colors.muted,
    },
    goalRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    goalPercent: {
        fontSize: 13,
        fontWeight: "800",
        color: colors.primary,
    },
    goalProgressTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: "#E2E8F0",
        overflow: "hidden",
    },
    goalProgressFill: {
        width: "78%",
        height: "100%",
        borderRadius: 999,
        backgroundColor: colors.primary,
    },
    menuCard: {
        borderRadius: 22,
        backgroundColor: colors.card,
        overflow: "hidden",
        ...shadow,
    },
    menuRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    menuDivider: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148,163,184,0.14)",
    },
    menuPressed: {
        opacity: 0.92,
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.mutedSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.foreground,
    },
    switchTrack: {
        width: 46,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.mutedSoft,
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    switchThumb: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.muted,
    },
    switchThumbActive: {
        alignSelf: "flex-end",
        backgroundColor: colors.primary,
    },
    logoutButton: {
        marginTop: 4,
        borderRadius: 18,
        backgroundColor: colors.card,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        ...shadow,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.destructive,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.42)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    infoCard: {
        width: "100%",
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    infoTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.foreground,
    },
    infoBody: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 20,
        color: colors.muted,
    },
    infoActions: {
        marginTop: 16,
        alignItems: "flex-end",
    },
    infoButton: {
        minWidth: 100,
    },
    editCard: {
        width: "100%",
        borderRadius: 24,
        backgroundColor: colors.card,
        padding: 18,
        ...shadow,
    },
    editFields: {
        gap: 12,
        marginTop: 14,
    },
    helperText: {
        fontSize: 12,
        color: colors.muted,
    },
    twoCol: {
        flexDirection: "row",
        gap: 10,
    },
    flexInput: {
        flex: 1,
    },
    errorText: {
        fontSize: 13,
        color: colors.destructive,
    },
    editActions: {
        flexDirection: "row",
        gap: 10,
    },
    actionButton: {
        flex: 1,
    },
    actionButtonPrimary: {
        flex: 1,
        backgroundColor: colors.primary,
    },
});
