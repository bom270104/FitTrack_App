"use client";

import { useMemo, useState } from "react";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { ArrowLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
];

const activityOptions = [
    { label: "Ít vận động", value: "sedentary" },
    { label: "Vận động nhẹ", value: "light" },
    { label: "Vận động vừa", value: "moderate" },
    { label: "Vận động nhiều", value: "active" },
    { label: "Rất năng động", value: "very_active" },
];

const goalOptions = [
    { label: "Tăng cân", value: "gain", delta: 300 },
    { label: "Giảm cân", value: "lose", delta: -300 },
    { label: "Giữ cân", value: "maintain", delta: 0 },
];

export function CaloriesScreen() {
    const { userData, healthData, setScreen, refreshHealth } = useApp();
    const [height, setHeight] = useState(String(userData?.height ?? ""));
    const [weight, setWeight] = useState(String(userData?.weight ?? ""));
    const [age, setAge] = useState(String(userData?.age ?? ""));
    const [gender, setGender] = useState(userData?.gender ?? "male");
    const [activityLevel, setActivityLevel] = useState(userData?.activityLevel ?? "moderate");
    const [goal, setGoal] = useState(userData?.goal ?? "maintain");
    const [result, setResult] = useState<{ bmr: number; tdee: number; recommendedCalories: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedGoal = useMemo(() => goalOptions.find((item) => item.value === goal) ?? goalOptions[2], [goal]);

    const calculateCalories = async () => {
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem("ft_token");
            const res = await fetch("http://localhost:5000/api/calories/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    weight: Number(weight),
                    height: Number(height),
                    age: Number(age),
                    gender,
                    activityLevel,
                    goal,
                }),
            });

            const body = await res.json();

            if (!res.ok) {
                setError(body.message || "Unable to calculate calories");
                setLoading(false);
                return;
            }

            setResult({
                bmr: body.data?.bmr ?? 0,
                tdee: body.data?.tdee ?? 0,
                recommendedCalories: body.data?.recommendedCalories ?? 0,
            });
            await refreshHealth();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <div className="flex items-center gap-4">
                    <button onClick={() => setScreen("dashboard")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">TDEE Calculator</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="mb-4 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
                            <Calculator className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm/none text-primary-foreground/80">Calories based on your body and goal</p>
                            <p className="text-2xl font-bold">{healthData.tdee} kcal/day</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-primary-foreground/80">
                        Goal: {selectedGoal.label} • Recommended: {healthData.calorieGoal} kcal/day
                    </p>
                </div>

                <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Nhập dữ liệu</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Chiều cao (cm)</label>
                            <Input value={height} onChange={(e) => setHeight(e.target.value)} type="number" className="mt-1 h-12 rounded-xl border-0 bg-muted" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Cân nặng (kg)</label>
                            <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" className="mt-1 h-12 rounded-xl border-0 bg-muted" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Tuổi</label>
                            <Input value={age} onChange={(e) => setAge(e.target.value)} type="number" className="mt-1 h-12 rounded-xl border-0 bg-muted" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Giới tính</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                                {genderOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Mức độ hoạt động</label>
                            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="mt-1 h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                                {activityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Mục tiêu</label>
                            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                                {goalOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

                    <Button onClick={calculateCalories} disabled={loading} className="mt-4 h-12 w-full rounded-xl bg-primary text-primary-foreground">
                        {loading ? "Đang tính..." : "Tính TDEE"}
                    </Button>
                </div>

                {result && (
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-foreground">Kết quả</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl bg-muted p-4">
                                <p className="text-xs text-muted-foreground">BMR</p>
                                <p className="mt-1 text-xl font-bold text-foreground">{result.bmr}</p>
                            </div>
                            <div className="rounded-xl bg-muted p-4">
                                <p className="text-xs text-muted-foreground">TDEE</p>
                                <p className="mt-1 text-xl font-bold text-foreground">{result.tdee}</p>
                            </div>
                            <div className="rounded-xl bg-muted p-4">
                                <p className="text-xs text-muted-foreground">Calo mục tiêu</p>
                                <p className="mt-1 text-xl font-bold text-foreground">{result.recommendedCalories}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
