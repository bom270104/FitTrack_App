import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import type { FoodSearchResult } from "../app-context";

const darkColors = {
    overlay: "rgba(15, 17, 23, 0.78)",
    background: "#0F1117",
    card: "#1C1E2A",
    border: "#2E3342",
    text: "#F8FAFC",
    muted: "#94A3B8",
    accent: "#00C896",
    input: "#161826",
    danger: "#F87171",
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSearch: (query: string) => Promise<FoodSearchResult[]>;
    onAdd: (food: FoodSearchResult, weightGrams: number) => Promise<void>;
    loading?: boolean;
};

export function SearchFoodModal({ visible, onClose, onSearch, onAdd, loading }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<FoodSearchResult[]>([]);
    const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
    const [weight, setWeight] = useState("100");
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) {
            setQuery("");
            setResults([]);
            setSelectedFood(null);
            setWeight("100");
            setError(null);
            setSearching(false);
            return;
        }

        const debounce = setTimeout(() => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setSearching(true);
            onSearch(query.trim())
                .then((items) => {
                    setResults(items);
                })
                .catch(() => {
                    setResults([]);
                })
                .finally(() => {
                    setSearching(false);
                });
        }, 400);

        return () => clearTimeout(debounce);
    }, [query, onSearch, visible]);

    const selectedFoodId = useMemo(() => selectedFood?._id, [selectedFood]);

    const handleConfirm = async () => {
        if (!selectedFood) {
            setError("Vui lòng chọn món ăn");
            return;
        }

        const parsedWeight = Number(weight);
        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
            setError("Khối lượng phải là số dương");
            return;
        }

        setError(null);
        await onAdd(selectedFood, parsedWeight);
        setSelectedFood(null);
        setWeight("100");
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Tìm thực phẩm</Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={22} color={darkColors.text} />
                            </Pressable>
                        </View>

                        <View style={styles.searchRow}>
                            <MaterialCommunityIcons name="magnify" size={20} color={darkColors.muted} />
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Nhập tên thực phẩm..."
                                placeholderTextColor={darkColors.muted}
                                style={styles.searchInput}
                            />
                        </View>
                        <Text style={styles.searchHint}>
                            Gõ tên món ăn, chọn kết quả và nhập khối lượng để thêm vào bữa ăn.
                        </Text>

                        {searching ? (
                            <ActivityIndicator style={styles.loader} color={darkColors.accent} />
                        ) : (
                            <FlatList
                                data={results}
                                keyExtractor={(item) => item._id}
                                style={styles.resultList}
                                keyboardShouldPersistTaps="handled"
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>
                                        {query.trim().length < 2
                                            ? "Nhập ít nhất 2 ký tự để tìm kiếm"
                                            : "Không tìm thấy món ăn"}
                                    </Text>
                                }
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => {
                                            setSelectedFood(item);
                                            setError(null);
                                            setWeight(String(Math.max(1, Math.round(item.servingSize || 100))));
                                        }}
                                        style={[
                                            styles.resultItem,
                                            selectedFoodId === item._id && styles.selectedResultItem,
                                        ]}
                                    >
                                        <View style={styles.resultItemContent}>
                                            <View style={styles.resultText}>
                                                <Text style={styles.resultName}>{item.name}</Text>
                                                <Text style={styles.resultMeta}>
                                                    {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                                                </Text>
                                                {item.category ? <Text style={styles.resultCategory}>{item.category}</Text> : null}
                                            </View>
                                        </View>
                                    </Pressable>
                                )}
                            />
                        )}

                        {selectedFood ? (
                            <View style={styles.addSection}>
                                <View style={styles.selectedPreview}>
                                    <Text style={styles.selectedLabel}>Đã chọn</Text>
                                    <View style={styles.selectedCard}>
                                        <Text style={styles.selectedName}>{selectedFood.name}</Text>
                                        <Text style={styles.selectedMeta}>
                                            {selectedFood.calories} kcal • {selectedFood.protein}g P • {selectedFood.carbs}g C • {selectedFood.fat}g F
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.sectionLabel}>Khối lượng (grams)</Text>
                                <TextInput
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                    style={styles.weightInput}
                                />
                                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                                <Button
                                    onPress={handleConfirm}
                                    title={loading ? "Đang lưu..." : "Xác nhận"}
                                    style={styles.submitButton}
                                    disabled={loading}
                                />
                            </View>
                        ) : null}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: darkColors.overlay,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        width: "100%",
        maxWidth: 500,
    },
    card: {
        backgroundColor: darkColors.background,
        borderRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 24,
        maxHeight: "85%",
        borderColor: darkColors.border,
        borderWidth: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    title: {
        color: darkColors.text,
        fontSize: 18,
        fontWeight: "800",
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: darkColors.card,
        alignItems: "center",
        justifyContent: "center",
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: darkColors.input,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    searchInput: {
        flex: 1,
        color: darkColors.text,
        fontSize: 15,
    },
    loader: {
        marginTop: 18,
    },
    resultList: {
        marginTop: 16,
        maxHeight: 280,
    },
    resultItem: {
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: darkColors.border,
        marginBottom: 10,
        backgroundColor: darkColors.card,
    },
    selectedResultItem: {
        borderColor: darkColors.accent,
        backgroundColor: "rgba(0, 200, 150, 0.14)",
    },
    resultItemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    resultText: {
        flex: 1,
    },
    resultName: {
        color: darkColors.text,
        fontSize: 15,
        fontWeight: "700",
    },
    resultMeta: {
        marginTop: 6,
        color: darkColors.muted,
        fontSize: 12,
    },
    resultCategory: {
        marginTop: 4,
        color: darkColors.accent,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    searchHint: {
        marginTop: 10,
        color: darkColors.muted,
        fontSize: 12,
        lineHeight: 18,
    },
    addSection: {
        marginTop: 18,
        paddingTop: 18,
        borderTopWidth: 1,
        borderColor: darkColors.border,
        gap: 14,
    },
    sectionLabel: {
        color: darkColors.text,
        fontSize: 13,
        fontWeight: "600",
    },
    selectedPreview: {
        gap: 10,
    },
    selectedLabel: {
        color: darkColors.muted,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.4,
        textTransform: "uppercase",
    },
    selectedCard: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 18,
        padding: 14,
    },
    selectedName: {
        color: darkColors.text,
        fontSize: 15,
        fontWeight: "700",
    },
    selectedMeta: {
        marginTop: 6,
        color: darkColors.muted,
        fontSize: 12,
    },
    weightInput: {
        backgroundColor: darkColors.input,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: darkColors.text,
        fontSize: 15,
    },
    submitButton: {
        marginTop: 4,
    },
    emptyText: {
        marginTop: 18,
        color: darkColors.muted,
        fontSize: 13,
        textAlign: "center",
    },
    errorText: {
        color: darkColors.danger,
        fontSize: 12,
        marginTop: 4,
    },
});
