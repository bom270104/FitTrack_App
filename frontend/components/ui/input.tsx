import React from "react";
import { StyleSheet, TextInput, type TextInputProps, type StyleProp, type ViewStyle, type TextStyle } from "react-native";

export type InputProps = TextInputProps & {
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
};

export function Input({ style, inputStyle, ...props }: InputProps) {
    return <TextInput placeholderTextColor="#94A3B8" style={[styles.input, style, inputStyle]} {...props} />;
}

const styles = StyleSheet.create({
    input: {
        minHeight: 48,
        borderRadius: 16,
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 16,
        color: "#0F172A",
        fontSize: 15,
    },
});