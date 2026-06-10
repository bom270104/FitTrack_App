import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useApp } from "../app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, shadow } from "../theme";

export function LoginScreen() {
    const { setScreen, login } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            Toast.show({ type: "info", text1: "Thông báo", text2: "Vui lòng nhập email và mật khẩu" });
            return;
        }

        try {
            const ok = await login(email, password);
            if (!ok) {
                Toast.show({ type: "error", text1: "Thông báo", text2: "Đăng nhập thất bại" });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            Toast.show({ type: "error", text1: "Thông báo", text2: "Không thể đăng nhập. Vui lòng thử lại sau." });
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <MaterialCommunityIcons name="heart-pulse" size={34} color={colors.primary} />
                </View>
                <Text style={styles.title}>Chào mừng trở lại</Text>
                <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputWrap}>
                        <MaterialCommunityIcons name="email-outline" size={20} color={colors.muted} style={styles.leadingIcon} />
                        <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Nhập email" style={styles.input} />
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrap}>
                        <MaterialCommunityIcons name="lock-outline" size={20} color={colors.muted} style={styles.leadingIcon} />
                        <Input value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="Nhập mật khẩu" style={[styles.input, styles.passwordInput]} />
                        <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.trailingIcon}>
                            <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
                        </Pressable>
                    </View>
                </View>

                <Pressable onPress={() => Toast.show({ type: "info", text1: "Thông báo", text2: "Chức năng đặt lại mật khẩu chưa được hỗ trợ." })} style={styles.forgotButton}>
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </Pressable>

                <Button onPress={handleLogin} title="Sign In" style={styles.primaryButton} contentStyle={styles.buttonContent} />

                <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>hoặc tiếp tục với</Text>
                    <View style={styles.divider} />
                </View>

                <View style={styles.socialRow}>
                    <Pressable onPress={() => Toast.show({ type: "info", text1: "Thông báo", text2: "Google login is not implemented in this demo." })} style={styles.socialButton}>
                        <Text style={styles.socialText}>G</Text>
                    </Pressable>
                    <Pressable onPress={() => Toast.show({ type: "info", text1: "Thông báo", text2: "Apple login is not implemented in this demo." })} style={styles.socialButton}>
                        <Text style={styles.socialText}></Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <Pressable onPress={() => setScreen("register")}>
                    <Text style={styles.footerAction}>Đăng ký</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 32,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: "#DCFCE7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.foreground,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: colors.muted,
    },
    form: {
        flex: 1,
        gap: 16,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.foreground,
    },
    inputWrap: {
        position: "relative",
        justifyContent: "center",
    },
    leadingIcon: {
        position: "absolute",
        left: 16,
        zIndex: 1,
    },
    trailingIcon: {
        position: "absolute",
        right: 16,
        zIndex: 1,
    },
    input: {
        paddingLeft: 44,
        paddingRight: 44,
        backgroundColor: colors.mutedSoft,
    },
    passwordInput: {
        paddingRight: 44,
    },
    forgotButton: {
        alignSelf: "flex-end",
    },
    forgotText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primary,
    },
    primaryButton: {
        marginTop: 12,
        minHeight: 56,
        borderRadius: 18,
        ...shadow,
    },
    buttonContent: {
        gap: 10,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginVertical: 8,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(148,163,184,0.25)",
    },
    dividerText: {
        fontSize: 13,
        color: colors.muted,
    },
    socialRow: {
        flexDirection: "row",
        gap: 12,
    },
    socialButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
    },
    socialText: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.foreground,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: colors.muted,
    },
    footerAction: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
});