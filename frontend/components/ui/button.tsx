import React from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";

type ButtonVariant = "default" | "outline";

export type ButtonProps = PressableProps & {
    variant?: ButtonVariant;
    title?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
};

export function Button({ variant = "default", title, style, textStyle, contentStyle, children, disabled, ...props }: ButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            disabled={disabled}
            style={({ pressed }) => [
                styles.base,
                variant === "outline" ? styles.outline : styles.default,
                pressed && !disabled ? styles.pressed : null,
                disabled ? styles.disabled : null,
                style,
            ]}
            {...props}
        >
            <View style={[styles.content, contentStyle]}>
                {title ? (
                    <Text style={[styles.title, variant === "outline" ? styles.outlineTitle : styles.defaultTitle, textStyle]}>{title}</Text>
                ) : React.isValidElement(children) || Array.isArray(children) ? (
                    children
                ) : typeof children === "string" || typeof children === "number" ? (
                    <Text style={[styles.title, variant === "outline" ? styles.outlineTitle : styles.defaultTitle, textStyle]}>{children}</Text>
                ) : null}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    default: {
        backgroundColor: "#0F766E",
    },
    outline: {
        borderWidth: 1,
        borderColor: "rgba(15, 23, 42, 0.12)",
        backgroundColor: "white",
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
    },
    defaultTitle: {
        color: "white",
    },
    outlineTitle: {
        color: "#0F172A",
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    disabled: {
        opacity: 0.5,
    },
});