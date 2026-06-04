"use client";

import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { Bell, Flame, Droplets, Target, TrendingDown, ChevronRight, Sigma } from "lucide-react";

export function DashboardScreen() {
    const { userData, healthData, setScreen } = useApp();

    // defensive helpers: some API responses may return objects for stats (server-side),
    // avoid rendering objects directly as React children.
    const asNumber = (v: any, fallback = 0) => {
        if (v == null) return fallback;
        if (typeof v === "number") return v;
        if (typeof v === "string" && v.trim() !== "") return Number(v) || fallback;
        return fallback;
    };

    const asDisplay = (v: any) => {
        if (v == null) return "-";
        if (typeof v === "object") return JSON.stringify(v);
        return String(v);
    };

    const waterPercentage = Math.round((asNumber(healthData.waterIntake) / asNumber(healthData.waterGoal)) * 100);
    const caloriePercentage = Math.round((asNumber(healthData.dailyCalories) / asNumber(healthData.calorieGoal)) * 100);
    const userWeightNum = asNumber((userData && (userData as any).weight) || 0);
    const weightProgress = Math.round(((userWeightNum - asNumber(healthData.currentWeight)) / Math.max(1, (userWeightNum - asNumber(healthData.targetWeight)))) * 100);

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Good morning</p>
                        <h1 className="text-xl font-bold text-foreground">{userData?.name ?? ""}</h1>
                    </div>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Bell className="h-5 w-5 text-foreground" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <button onClick={() => setScreen("bmi")} className="mb-4 w-full rounded-3xl bg-gradient-to-br from-primary to-secondary p-5 text-left">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary-foreground/80">Your BMI</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-primary-foreground">{asDisplay(healthData.bmi)}</span>
                                <span className="text-sm text-primary-foreground/70">kg/m2</span>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
                            <Target className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium text-primary-foreground">Normal Weight</span>
                        <ChevronRight className="ml-auto h-4 w-4 text-primary-foreground/70" />
                    </div>
                </button>

                <div className="mb-4 grid grid-cols-2 gap-3">
                    <button onClick={() => setScreen("statistics")} className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                                <Flame className="h-4 w-4 text-accent" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">Calories</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl font-bold text-foreground">{asDisplay(healthData.dailyCalories)}</span>
                            <span className="ml-1 text-xs text-muted-foreground">/ {asDisplay(healthData.calorieGoal)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(caloriePercentage, 100)}%` }} />
                        </div>
                    </button>

                    <button onClick={() => setScreen("water")} className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
                                <Droplets className="h-4 w-4 text-secondary" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">Water</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl font-bold text-foreground">{asDisplay(healthData.waterIntake)}</span>
                            <span className="ml-1 text-xs text-muted-foreground">/ {asDisplay(healthData.waterGoal)} ml</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${Math.min(waterPercentage, 100)}%` }} />
                        </div>
                    </button>
                </div>

                <button onClick={() => setScreen("goals")} className="mb-4 w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <TrendingDown className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Weight Goal</p>
                                <p className="text-xs text-muted-foreground">{asDisplay(userData?.weight)}kg → {asDisplay(healthData.targetWeight)}kg</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-primary">{Math.max(0, weightProgress)}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${Math.max(0, Math.min(weightProgress, 100))}%` }} />
                        </div>
                    </div>
                </button>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Daily Energy Expenditure</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-foreground">{asDisplay(healthData.tdee)}</p>
                            <p className="text-xs text-muted-foreground">calories/day (TDEE)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-primary">-200 cal</p>
                            <p className="text-xs text-muted-foreground">deficit for weight loss</p>
                        </div>
                    </div>
                    <button onClick={() => setScreen("calories")} className="mt-4 flex w-full items-center justify-between rounded-xl bg-muted px-4 py-3 text-left">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Sigma className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Open TDEE calculator</p>
                                <p className="text-xs text-muted-foreground">Compute calories for gain, lose, or maintain</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}