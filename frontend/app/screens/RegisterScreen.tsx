import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useApp } from "../app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, shadow } from "../theme";

export function RegisterScreen() {
    const { setScreen, register } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Toast.show({ type: "info", text1: "Thông báo", text2: "Vui lòng nhập đủ thông tin bắt buộc" });
            return;
        }

        try {
            const ok = await register({ fullName: name, email, password });
            if (!ok) {
                Toast.show({ type: "error", text1: "Thông báo", text2: "Đăng ký thất bại" });
                return;
            }

            Toast.show({ type: "success", text1: "Thông báo", text2: "Đăng ký thành công" });
            setTimeout(() => {
                setScreen("login");
            }, 3000);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            Toast.show({ type: "error", text1: "Thông báo", text2: "Không thể đăng ký. Vui lòng thử lại sau." });
        }
    };

    return (
        <View style={styles.root}>
            <Pressable onPress={() => setScreen("login")} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
            </Pressable>

            <View style={styles.header}>
                <View style={styles.logo}>
                    <MaterialCommunityIcons name="account-plus-outline" size={34} color={colors.primary} />
                </View>
                <Text style={styles.title}>Tạo tài khoản</Text>
                <Text style={styles.subtitle}>Bắt đầu hành trình sức khỏe của bạn</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.field}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <View style={styles.inputWrap}>
                        <MaterialCommunityIcons name="account-outline" size={20} color={colors.muted} style={styles.leadingIcon} />
                        <Input value={name} onChangeText={setName} placeholder="Nhập tên của bạn" style={styles.input} />
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputWrap}>
                        <MaterialCommunityIcons name="email-outline" size={20} color={colors.muted} style={styles.leadingIcon} />
                        <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Nhập email" style={styles.input} />
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Mật khẩu</Text>
                    <View style={styles.inputWrap}>
                        <MaterialCommunityIcons name="lock-outline" size={20} color={colors.muted} style={styles.leadingIcon} />
                        <Input value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="Tạo mật khẩu" style={[styles.input, styles.passwordInput]} />
                        <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.trailingIcon}>
                            <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
                        </Pressable>
                    </View>
                </View>

                <Text style={styles.note}>
                    Bằng cách đăng ký, bạn đồng ý với <Text style={styles.noteLink}>Điều khoản dịch vụ</Text> và <Text style={styles.noteLink}>Chính sách bảo mật</Text>
                </Text>

                <Button onPress={handleRegister} title="Tạo tài khoản" style={styles.primaryButton} contentStyle={styles.buttonContent} />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <Pressable onPress={() => setScreen("login")}>
                    <Text style={styles.footerAction}>Đăng nhập</Text>
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
    backButton: {
        position: "absolute",
        top: 16,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.mutedSoft,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    header: {
        alignItems: "center",
        marginTop: 12,
        marginBottom: 32,
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
        textAlign: "center",
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
    note: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.muted,
    },
    noteLink: {
        color: colors.primary,
        fontWeight: "600",
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
