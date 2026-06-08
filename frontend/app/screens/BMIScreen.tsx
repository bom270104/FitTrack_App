"use client";

import { useState } from "react";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { ArrowLeft, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const bmiCategories = [
    { range: "< 18.5", label: "Gầy", color: "bg-secondary" },
    { range: "18.5 - 24.9", label: "Bình thường", color: "bg-primary" },
    { range: "25 - 29.9", label: "Thừa cân", color: "bg-chart-4" },
    { range: "> 30", label: "Béo phì", color: "bg-destructive" },
];

function getBMICategory(bmi: number) {
    if (bmi < 18.5) return { label: "Gầy", color: "text-secondary" };
    if (bmi < 25) return { label: "Bình thường", color: "text-primary" };
    if (bmi < 30) return { label: "Thừa cân", color: "text-chart-4" };
    return { label: "Béo phì", color: "text-destructive" };
}

export function BMIScreen() {
    const { userData, healthData, setScreen, updateWeight, postBmi } = useApp();
    const [height, setHeight] = useState(String(userData?.height ?? ""));
    const [weight, setWeight] = useState(String(healthData.currentWeight ?? ""));
    const initialBmi = typeof (healthData as any).bmi === "number" ? (healthData as any).bmi : (healthData as any).bmi?.latest?.bmi ?? 0;
    const [calculatedBMI, setCalculatedBMI] = useState<number>(initialBmi);

    const category = getBMICategory(calculatedBMI);

    const calculateBMI = async () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            const bmi = parseFloat((w / (h * h)).toFixed(1));
            setCalculatedBMI(bmi);
            updateWeight(w);
            try {
                await postBmi({ height: parseFloat(height), weight: w, bmi });
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            }
        }
    };

    const indicatorPosition = Math.min(Math.max(((calculatedBMI - 15) / 25) * 100, 0), 100);

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <div className="flex items-center gap-4">
                    <button onClick={() => setScreen("dashboard")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">Máy tính BMI</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="mb-6 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6">
                    <div className="mb-6 text-center">
                        <p className="mb-1 text-sm text-primary-foreground/80">BMI của bạn</p>
                        <p className="text-6xl font-bold text-primary-foreground">{calculatedBMI}</p>
                        <p className="mt-2 text-lg font-medium text-primary-foreground">{category.label}</p>
                    </div>

                    <div className="relative mt-6">
                        <div className="flex h-3 overflow-hidden rounded-full">
                            <div className="flex-1 bg-secondary" />
                            <div className="flex-1 bg-primary" />
                            <div className="flex-1 bg-chart-4" />
                            <div className="flex-1 bg-destructive" />
                        </div>
                        <div className="absolute -top-1 h-5 w-5 -translate-x-1/2 transform rounded-full border-2 border-foreground bg-primary-foreground shadow-lg transition-all duration-300" style={{ left: `${indicatorPosition}%` }} />
                        <div className="mt-2 flex justify-between text-[10px] text-primary-foreground/70">
                            <span>15</span>
                            <span>18.5</span>
                            <span>25</span>
                            <span>30</span>
                            <span>40</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Tính BMI</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Chiều cao (cm)</label>
                            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 h-12 rounded-xl border-0 bg-muted text-lg font-semibold" placeholder="175" />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Cân nặng (kg)</label>
                            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 h-12 rounded-xl border-0 bg-muted text-lg font-semibold" placeholder="70" />
                        </div>

                        <Button onClick={calculateBMI} className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
                            Tính BMI
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Phân loại BMI</h3>
                    </div>

                    <div className="space-y-3">
                        {bmiCategories.map((cat) => (
                            <div key={cat.label} className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                                <span className="flex-1 text-sm text-foreground">{cat.label}</span>
                                <span className="text-xs text-muted-foreground">{cat.range}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}